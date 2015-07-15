# -*- Mode: Python; coding: utf-8; indent-tabs-mode: nil; tab-width: 4 -*-

from application_tests.tests import HTML5TestCaseBase

from testtools.matchers import NotEquals, Equals


class LaunchTestCaseBase(HTML5TestCaseBase):
    def setUp(self):
        super(LaunchTestCaseBase, self).setUp()

    def test_basic_launch(self):
        self.launch_html5_app()

        html5_doc_buttons = self.page.find_elements_by_css_selector(
            "#hello-page a")

        self.assertThat(html5_doc_buttons, NotEquals(None))
        self.assertThat(len(html5_doc_buttons), Equals(2))

