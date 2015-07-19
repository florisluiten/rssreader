describe("RSSreader", function() {
    var application;

    var MockedUIContext = function() {}
    MockedUIContext.prototype.init = function() {
        this.pagestack = [];
    };

    beforeEach(function() {
        application = new Rssreader(MockedUIContext);
    });

    it("should have the debug flag disabled", function() {
        application.init();

        expect(application.settings.debug).toBe(false);
    });
});

