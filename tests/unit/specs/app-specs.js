describe("RSSreader", function() {
    var application;

    var MockedUIContext = function() {}
    MockedUIContext.prototype.init = function() {
        this.pagestack = [];
    };

    beforeEach(function() {
		localStorage.clear();

        application = new Rssreader(MockedUIContext);
    });

    it("should have the debug flag disabled", function () {
        application.init();

        expect(application.settings.debug).toBe(false);
    });
});

describe('RSSreader update', function() {
    var application;

    var MockedUIContext = function() {}
    MockedUIContext.prototype.init = function() {
        this.pagestack = [];
    };

    beforeEach(function() {
		localStorage.clear();

        application = new Rssreader(MockedUIContext);

        application.init();

        application.settings.feeds = [
            {
                url: 'void://example.com',
                count: 0,
                feed: {
                    title: 'Void feed',
                    articles: [
                        {
                            title: 'Title 2',
                            description: 'Description 2',
                            link: 'void://example.com/article2'
                        },
                        {
                            title: 'Title 1',
                            description: 'Description 1',
                            link: 'void://example.com/article1'
                        }
                    ]
                }
            }
        ];
    });

    it('should add "read" flag (true) to an existing article on update', function () {
        application.updateFeed(0, {});

        expect(application.settings.feeds[0].feed.articles[0].read).toBe(true);
        expect(application.settings.feeds[0].feed.articles[1].read).toBe(true);
        expect(application.settings.feeds[0].feed.unreadCount).toBe(0);
    });

    it('should set "read" flag (false) for new articles', function () {
        application.updateFeed(
            0,
            {
                title: 'Void feed',
                articles: [
                    {
                        title: 'Title 4',
                        description: 'Description 4',
                        link: 'void://example.com/article4'
                    },
                    {
                        title: 'Title 3',
                        description: 'Description 3',
                        link: 'void://example.com/article3'
                    },
                    {
                        title: 'Title 2',
                        description: 'Description 2',
                        link: 'void://example.com/article2'
                    }
                ]
            }
        );

        expect(application.settings.feeds[0].feed.articles[0].read).toBe(false);
        expect(application.settings.feeds[0].feed.articles[1].read).toBe(false);
        expect(application.settings.feeds[0].feed.articles[2].read).toBe(true);
        expect(application.settings.feeds[0].feed.articles[3].read).toBe(true);
        expect(application.settings.feeds[0].feed.unreadCount).toBe(2);
    });

    it('should decrease total unread count when an unread article is marked read', function () {
        application.updateFeed(
            0,
            {
                title: 'Void feed',
                articles: [
                    {
                        title: 'Title 4',
                        description: 'Description 4',
                        link: 'void://example.com/article4'
                    },
                    {
                        title: 'Title 3',
                        description: 'Description 3',
                        link: 'void://example.com/article3'
                    },
                    {
                        title: 'Title 2',
                        description: 'Description 2',
                        link: 'void://example.com/article2'
                    }
                ]
            }
        );

        expect(application.settings.feeds[0].feed.unreadCount).toBe(2);

        application.markRead(0, 0);

        expect(application.settings.feeds[0].feed.unreadCount).toBe(1);
    });

    it('should not decrease total unread count when an read article is marked read', function () {
        application.updateFeed(
            0,
            {
                title: 'Void feed',
                articles: [
                    {
                        title: 'Title 4',
                        description: 'Description 4',
                        link: 'void://example.com/article4'
                    },
                    {
                        title: 'Title 3',
                        description: 'Description 3',
                        link: 'void://example.com/article3'
                    },
                    {
                        title: 'Title 2',
                        description: 'Description 2',
                        link: 'void://example.com/article2'
                    }
                ]
            }
        );

        expect(application.settings.feeds[0].feed.unreadCount).toBe(2);

        application.markRead(0, 2);

        expect(application.settings.feeds[0].feed.unreadCount).toBe(2);
    });

	it('should load new articles before old articles', function() {
		expect(application.settings.feeds[0].feed.articles[0].link).toBe('void://example.com/article2');
		expect(application.settings.feeds[0].feed.articles[1].link).toBe('void://example.com/article1');

        application.updateFeed(
            0,
            {
                title: 'Void feed',
                articles: [
                    {
                        title: 'Title 4',
                        description: 'Description 4',
                        link: 'void://example.com/article4'
                    },
                    {
                        title: 'Title 3',
                        description: 'Description 3',
                        link: 'void://example.com/article3'
                    },
                    {
                        title: 'Title 2',
                        description: 'Description 2',
                        link: 'void://example.com/article2'
                    }
                ]
            }
        );

		expect(application.settings.feeds[0].feed.articles[0].link).toBe('void://example.com/article4');
		expect(application.settings.feeds[0].feed.articles[1].link).toBe('void://example.com/article3');
		expect(application.settings.feeds[0].feed.articles[2].link).toBe('void://example.com/article2');
		expect(application.settings.feeds[0].feed.articles[3].link).toBe('void://example.com/article1');

		expect(application.settings.feeds[0].feed.articles.length).toBe(4);
	});

    it('should not mess with unread count on updates', function () {
        application.updateFeed(
            0,
            {
            }
        );

        expect(application.settings.feeds[0].feed.unreadCount).toBe(0);

        application.updateFeed(
            0,
            {
                title: 'Void feed',
                articles: [
                    {
                        title: 'Title 5',
                        description: 'Description 5',
                        link: 'void://example.com/article5'
                    },
                    {
                        title: 'Title 4',
                        description: 'Description 4',
                        link: 'void://example.com/article4'
                    },
                    {
                        title: 'Title 3',
                        description: 'Description 3',
                        link: 'void://example.com/article3'
                    },
                    {
                        title: 'Title 2',
                        description: 'Description 2',
                        link: 'void://example.com/article2'
                    }
                ]
            }
        );

        expect(application.settings.feeds[0].feed.unreadCount).toBe(3);

        application.markRead(0, 1);

        expect(application.settings.feeds[0].feed.unreadCount).toBe(2);

        application.updateFeed(
            0,
            {
                title: 'Void feed',
                articles: [
                    {
                        title: 'Title 5',
                        description: 'Description 5',
                        link: 'void://example.com/article5'
                    },
                    {
                        title: 'Title 4',
                        description: 'Description 4',
                        link: 'void://example.com/article4'
                    },
                    {
                        title: 'Title 3',
                        description: 'Description 3',
                        link: 'void://example.com/article3'
                    },
                    {
                        title: 'Title 2',
                        description: 'Description 2',
                        link: 'void://example.com/article2'
                    }
                ]
            }
        );
        
        expect(application.settings.feeds[0].feed.unreadCount).toBe(2);
    });
});
