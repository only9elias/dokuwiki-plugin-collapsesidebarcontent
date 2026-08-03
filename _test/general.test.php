<?php

/**
 * General tests for the collapsesidebarcontent plugin
 *
 * @group plugin_collapsesidebarcontent
 * @group plugins
 */

use dokuwiki\MailUtils;

class general_plugin_collapsesidebarcontent_test extends DokuWikiTest
{
    /**
     * Simple test to make sure the plugin.info.txt is in correct format
     */
    public function test_plugininfo()
    {
        $file = __DIR__ . '/../plugin.info.txt';
        $this->assertFileExists($file);

        $info = confToHash($file);

        $this->assertArrayHasKey('base', $info);
        $this->assertArrayHasKey('author', $info);
        $this->assertArrayHasKey('email', $info);
        $this->assertArrayHasKey('date', $info);
        $this->assertArrayHasKey('name', $info);
        $this->assertArrayHasKey('desc', $info);
        $this->assertArrayHasKey('url', $info);

        $this->assertEquals('collapsesidebarcontent', $info['base']);
        $this->assertMatchesRegularExpression('/^https?:\/\//', $info['url']);
        $this->assertTrue(MailUtils::isValid($info['email']));
        $this->assertMatchesRegularExpression('/^\d\d\d\d-\d\d-\d\d$/', $info['date']);
        $this->assertTrue(false !== strtotime($info['date']));
    }
}
