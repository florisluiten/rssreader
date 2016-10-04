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
		application.settings.feeds = [
			{
				url: 'void://example.com',
				count: 0,
				feed: {
					title: 'Void feed',
					articles: [
					]
				}
			}
		];

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

		expect(application.settings.feeds[0].feed.articles.length).toBe(3);
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

		expect(application.settings.feeds[0].feed.articles.length).toBe(4);
		expect(application.settings.feeds[0].feed.unreadCount).toBe(3);
	});
});

describe('RSSreader articles', function() {
	var application;

	var MockedUIContext = function() {}
	MockedUIContext.prototype.init = function() {
		this.pagestack = [];
	};

	beforeEach(function() {
		localStorage.clear();

		application = new Rssreader(MockedUIContext);

		application.init();

		application.settings.maxArticlesPerFeed = 3;

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

	it('should not exceed maxArticlesPerFeed', function () {
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

		expect(application.settings.feeds[0].feed.articles.length).toBe(3);
	});
});

describe('RSSreader articleToSafeID', function() {
	var application;

	var MockedUIContext = function() {}
	MockedUIContext.prototype.init = function() {
		this.pagestack = [];
	};

	beforeEach(function() {
		localStorage.clear();

		application = new Rssreader(MockedUIContext);
    });

    it('should not contain anything but a-z, A-Z, 0-9, -, :, or _', function () {
        expect(
            application.articleToSafeID({guid: 'normal string'}).replace(/[a-zA-Z0-9_:-]/g, '')
        ).toBe('');

        expect(
            application.articleToSafeID({link: 'http://link.to-somehwere/over-the?rainbow'}).replace(/[a-zA-Z0-9_:-]/g, '')
        ).toBe('');

        expect(
            application.articleToSafeID({guid: '`!@#$%^&*()_+-=[]{};\'\\:"|,./<>?'}).replace(/[a-zA-Z0-9_:-]/g, '')
        ).toBe('');
    });
});

describe('RSSreader guid', function() {
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
							link: 'void://example.com/article2',
							guid: 'article2'
						},
						{
							title: 'Title 1',
							description: 'Description 1',
							link: 'void://example.com/article1',
							guid: 'article1'
						}
					]
				}
			}
		];
	});

	it('should be used instead of link', function () {
		expect(application.settings.feeds[0].feed.articles.length).toBe(2);

		application.updateFeed(
			0,
			{
				title: 'Void feed',
				articles: [
					{
						title: 'Title 3',
						description: 'Description 3',
						link: 'void://example.com/article3',
						guid: 'article3'
					},
					{
						title: 'Title 2',
						description: 'Description 2 has been updated',
						link: 'void://example.com/article2-updated',
						guid: 'article2'
					}
				]
			}
		);

		expect(application.settings.feeds[0].feed.articles.length).toBe(3);
	});
});

validOpml = '<?xml version="1.0" encoding="UTF-8"?> <opml version="1.1"> <head> <title>RSS feeds</title> </head> <body> <outline title="Intel Developer Zone Articles" type="rss" xmlUrl="https://software.intel.com/en-us/articles/feed/" /> <outline title="Black Hat Announcements" type="rss" xmlUrl="https://www.blackhat.com/BlackHatRSS.xml" /> <outline title="Project Zero" type="rss" xmlUrl="http://googleprojectzero.blogspot.com/feeds/posts/default?alt=rss"/> </body> </opml>';
emptyOpml = '<?xml version="1.0" encoding="UTF-8"?> <opml version="1.1"> <head> <title>RSS feeds</title> </head> <body> <outline title="Intel Developer Zone Articles" type="other" xmlUrl="https://software.intel.com/en-us/articles/feed/" /> </body> </opml>';
emptyOpml2 = '<?xml version="1.0" encoding="UTF-8"?> <opml version="1.1"> <head> <title>RSS feeds</title> </head> <body> <outline title="Intel Developer Zone Articles" type="rss" > </body> </opml>';

describe('RSSreader import', function() {
	var application;

	var MockedUIContext = function() {}
	MockedUIContext.prototype.init = function() {
		this.pagestack = [];
	};

	beforeEach(function() {
		application = new Rssreader(MockedUIContext);
	});

	it('should validate regular feed', function () {
		expect(application.isValidImport(validOpml)).toBe(true);
	});

	it('should expect at least one feed with type "rss"', function () {
		expect(application.isValidImport(emptyOpml)).toBe(false);
	});

	it('should expect at least one feed with attribute xmlUrl', function () {
		expect(application.isValidImport(emptyOpml2)).toBe(false);
	});

	it('should not think a random string is an import file', function() {
		expect(application.isValidImport('randomstring')).toBe(false);
	});

	it('should not choke on binary string', function() {
		expect(application.isValidImport(atob('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'))).toBe(false);
	});
});

