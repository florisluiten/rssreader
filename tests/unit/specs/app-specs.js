describe("App", function() {
    var application;

    var MockedUIContext = function() {}
    MockedUIContext.prototype.init = function() { }

    beforeEach(function() {
        application = new Application(MockedUIContext);
    });

    it("should have a proper initialized flag", function() {
        application.init();
        expect(application.initialized()).toBeTruthy();
    });
});

