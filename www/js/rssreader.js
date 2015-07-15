// vim: tabstop=4:shiftwidth=4:expandtab
function Rssreader(UIContext) {
    "use strict";

    this._uiContextClass = UIContext;
    this._initialized = false;

    this.settings = {
        debug: false,
        feeds: [],
        maxArticlesPerFeed: 100
    };
}

/**
 * Add a feed. Please make sure feed isValid before adding it
 *
 * @return true
 */
Rssreader.prototype.addFeed = function (feedlocation) {
    "use strict";

    var reader = this;

    reader.settings.feeds.push({
        url: feedlocation
    });

    reader.storeSettings();

    window.location.reload();
};

/**
 * Attach a feed to the view.
 *
 * @param {integer} feedIndex The feed index
 *
 * @return false if the data could not be handled, true otherwise
 */
Rssreader.prototype.attachFeed = function (feedIndex) {
    "use strict";

    var reader = this,
        $content = $('<a />'),
        $feed = $('#feeds>ul li[data-count="' + reader.settings.feeds[feedIndex].count + '"]');

    $feed.empty();

    if (reader.settings.feeds[feedIndex].feed === undefined) {
        return false;
    }

    $content.attr('href', '#').on('click', function (e) {
        e.preventDefault();

        reader.openFeed(feedIndex);
    });
    $content.append(reader.settings.feeds[feedIndex].feed.title);

    $('#feeds>ul li[data-count="' + reader.settings.feeds[feedIndex].count + '"]').append($content);
};

/**
 * Get the feed via jQuery.ajax
 *
 * @param {object}   the feed object
 * @param {function} what function to execute on success
 *
 * @return void
 */
Rssreader.prototype.getFeed = function (feed, onSuccess) {
    "use strict";

    var reader = this;

    if (reader.settings.debug) {
        console.log('Getting feed "' + feed.url + '"');
    }

    $.ajax({
        type: 'GET',
        url: feed.url,
        success: function (data) {
            if (reader.settings.debug) {
                console.log('Retreived data for "' + feed.url + '"');
            }

            onSuccess($(data));
        },
        error: function (error) {
            console.log('Failed to retreive feed: ' + feed.url, error);
        }
    });
};

/**
 * Initializer
 *
 * @return void
 */
Rssreader.prototype.init = function () {
    "use strict";

    if (this._uiContextClass && !this._initialized) {
        this._initialized = true;
        this.UI = new this._uiContextClass();

        var reader = this;

        reader.loadSettings();

        this.UI.init();

        reader.UI.pagestack.push("main");

        this.initAddFeedDialog();
        $('#clear_all').click(function (e) {
            e.preventDefault();

            localStorage.clear();

            window.location.reload();
        });

        $('#close_feedback').click(function (e) {
            e.preventDefault();

            reader.UI.dialog("feedback").hide();
        });

        $('#display_settings').click(function (e) {
            e.preventDefault();

            reader.UI.pagestack.push("settings");
        });

        this.resetFeeds();

        $.each(reader.settings.feeds, function (feedIndex) {
            reader.attachFeed(feedIndex);
        });

        this.refreshFeeds();
    }
};

/**
 * Are we yet initialized?
 *
 * @return boolean
 */
Rssreader.prototype.initialized = function () {
    "use strict";

    return this._initialized;
};

/**
 * Initialize the "add feed" dialog
 *
 * @return void
 */
Rssreader.prototype.initAddFeedDialog = function () {
    "use strict";

    var reader = this;

    $('#add_feed').click(function (e) {
        e.preventDefault();

        $('#add_feed_dialog').show().find('.location').focus();
    });

    $('#add_feed_dialog .cancel').click(function () {
        $('#add_feed_dialog').hide();
    });

    $('#add_feed_dialog .submit').click(function () {
        reader.UI.dialog("loading").show();

        var $location = $('#add_feed_dialog').find('.location');

        if ($location.val().length < 1) {
            reader.UI.dialog("loading").hide();

            reader.userFeedback('Please enter a location');
            $location.focus();
            return false;
        }

        reader.isValidFeed(
            $location.val(),
            function (loc) {
                reader.addFeed(loc);
                reader.userFeedback('Feed has been added');

                reader.UI.dialog("loading").hide();

                $location.val('');
                $('#add_feed_dialog').hide();
            },
            function () {
                reader.UI.dialog("loading").hide();

                reader.userFeedback('The specified location seems not a valid RSS feed');
                $location.focus();
                return false;
            }
        );
    });
};

/**
 * Check if feed is valid
 *
 * @param {string}   loc     The location to check
 * @param {function} success callback on success
 * @param {function} error   callback on error
 *
 * @return void
 */
Rssreader.prototype.isValidFeed = function (loc, success, error) {
    "use strict";

    if (loc.substr(0, 7) !== 'http://' && loc.substr(0, 8) !== 'https://' && loc.substr(0, 1) !== '/') {
        loc = 'http://' + loc;
    }

    $.ajax({
        type: 'GET',
        url: loc,
        success: function (data) {
            if ($(data).find('channel > title').length !== 1) {
                console.log('isValidFeed finds inccorect amount of channel > title');
                error();
                return;
            }

            if ($(data).find('item').length === 0) {
                console.log('isValidFeed finds no item elements');
                error();
                return;
            }

            if ($(data).find('item > title').length === 0) {
                console.log('isValidFeed finds no item > title elements');
                error();
                return;
            }

            if ($(data).find('item > description').length === 0) {
                console.log('isValidFeed finds no item > description elements');
                error();
                return;
            }
            if ($(data).find('item > link').length === 0) {
                console.log('isValidFeed finds no item > link elements');
                error();
                return;
            }
            console.log('isValidFeed success');

            success(loc);
        },
        error: function () {
            console.log('isValidFeed failed AJAX request');

            error();
        }
    });

    return;
};

/**
 * Open an article and show it
 *
 * @param {integer} feedIndex    The feed index
 * @param {integer} articleIndex The article index
 *
 * @return void
 */
Rssreader.prototype.openArticle = function (feedIndex, articleIndex) {
    "use strict";

    var $content,
        reader = this,
        article = reader.settings.feeds[feedIndex].feed.articles[articleIndex];

    $content = $('<div class="article">');
    $content.append($('<h2 />').html(article.title));
    $content.append($('<p />').text(article.description));
    $content.append(
        $('<p class="readmore" />').append(
            $('<a />').attr('href', article.link)
                .attr('target', '_blank')
                .html('Read more')
        )
    );

    $('#article>div').replaceWith($content);

    reader.UI.pagestack.push("article");
};

/**
 * Open a feed an show the articles
 *
 * @param {integer} feedIndex The feed index
 *
 * @return void
 */
Rssreader.prototype.openFeed = function (feedIndex) {
    "use strict";

    var reader = this,
        $content,
        $articles = $('#articles>ul');

    $.each(reader.settings.feeds[feedIndex].feed.articles, function (articleIndex) {
        $content = $('<a />');

        $content.attr('href', '#').on('click', function (e) {
            e.preventDefault();

            reader.openArticle(feedIndex, articleIndex);
        });

        $content.append(reader.settings.feeds[feedIndex].feed.articles[articleIndex].title);

        $articles.append($('<li />').append($content));
    });

    reader.UI.pagestack.push("feed");
};

/**
 * Refresh all feeds simultaneous by calling refreshFeed for each
 * feed in the settings
 *
 * @return void
 */
Rssreader.prototype.refreshFeeds = function () {
    "use strict";

    var reader = this;

    $.each(reader.settings.feeds, function (i) {
        reader.refreshFeed(i);
    });
};

/**
 * Refresh the specified feed. Upon retreival of the feed the feed.feed
 * is updated and then attachFeed() is called.
 *
 * @param {integer} The feed index
 *
 * @return false if feed is not valid, true otherwise
 */
Rssreader.prototype.refreshFeed = function (feedIndex) {
    "use strict";

    var reader = this;

    if (!reader.settings.feeds[feedIndex].url) {
        return false;
    }

    reader.getFeed(
        reader.settings.feeds[feedIndex],
        function (xml) {
            reader.updateFeed(feedIndex, reader.xmlToFeed(xml));

            reader.storeSettings();

            reader.attachFeed(feedIndex);
        }
    );
};

/**
 * Reset the feeds by clearing it and adding a loading container for each
 * feed
 *
 * @return void
 */
Rssreader.prototype.resetFeeds = function () {
    "use strict";

    var reader = this;

    $('#feeds').children().remove();

    $('#feeds').html('<ul />');

    $.each(reader.settings.feeds, function (i) {
        reader.settings.feeds[i].count = i;

        $('#feeds>ul').append('<li data-count="' + i + '"><progress></progress><span class="loading"></span></li>');
    });
};

/**
 * Store the current settings
 *
 * @return void
 */
Rssreader.prototype.storeSettings = function () {
    "use strict";

    var reader = this;

    localStorage.settings = JSON.stringify(reader.settings);
};

/**
 * load the settings and set signature on each feed
 *
 * @return void
 */
Rssreader.prototype.loadSettings = function () {
    "use strict";

    var reader = this;

    if (localStorage.settings === undefined) {
        this.storeSettings();
    } else {
        try {
            reader.settings = JSON.parse(localStorage.settings);
        } catch (e) {
            console.log(e);
        }
    }

    $.each(reader.settings.feeds, function (i) {
        if (reader.settings.feeds[i].signature === undefined) {
            reader.settings.feeds[i].signature = btoa(reader.settings.feeds[i].url);

            if (reader.settings.debug) {
                console.log(
                    'Setting feed signature for "' + reader.settings.feeds[i].url
                        + '" to "' + reader.settings.feeds[i].signature + '"'
                );
            }
        }
    });
};

/**
 * Send user feedback
 *
 * @return void
 */
Rssreader.prototype.userFeedback = function (feedback) {
    "use strict";

    var reader = this;

    $('#feedback .inner').html(feedback);
    reader.UI.dialog("feedback").show();
};

/**
 * Update feed with new data
 *
 * @param {integer} feedIndex The feed index
 * @param {object}  feed      Feed object as returned by xmlToFeed
 *
 * @return false if feedIndex does not exist, true otherwise
 */
Rssreader.prototype.updateFeed = function (feedIndex, feedObject) {
    var reader = this,
        latestArticle;

    if (reader.settings.feeds[feedIndex] === undefined) {
        return false;
    }

    if (reader.settings.feeds[feedIndex].feed === undefined) {
        reader.settings.feeds[feedIndex].feed = feedObject;

        return true;
    }

    latestArticle = reader.settings.feeds[feedIndex].feed.articles[0];

    $.each(feedObject.articles, function (i) {
        if (feedObject.articles[i].link == latestArticle.link) {
            return false; //break
        };

        reader.settings.feeds[feedIndex].feed.articles.unshift(feedObject.articles[i]);
    });

    reader.settings.feeds[feedIndex].feed.articles = reader.settings.feeds[feedIndex].feed.articles.splice(0, reader.settings.maxArticlesPerFeed);

    reader.settings.feeds[feedIndex].feed.title = feedObject.title;
};

/**
 * Convert a XML document to a feed object
 *
 * @param {object} $xml The XML jQuery object
 *
 * @return object with attributes: title
 */
Rssreader.prototype.xmlToFeed = function ($xml) {
    "use strict";

    var articles = [];

    $.each($xml.find('item'), function () {
        articles.push(
            {
                title: $(this).find('title').text(),
                description: $(this).find('description').text(),
                link: $(this).find('link').text()
            }
        );
    });

    return {
        title: $xml.find('channel > title').html(),
        articles: articles
    };
};
