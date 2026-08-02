<?php

/**
 * Action component for Collapse Sidebar Content
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  only9elias
 */

use dokuwiki\Extension\ActionPlugin;
use dokuwiki\Extension\Event;
use dokuwiki\Extension\EventHandler;

class action_plugin_collapsesidebarcontent extends ActionPlugin
{
    /**
     * @param EventHandler $controller
     * @return void
     */
    public function register(EventHandler $controller)
    {
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, 'handleStarted');
    }

    /**
     * Expose plugin config to JavaScript via JSINFO.
     *
     * @param Event $event
     * @param mixed $param
     * @return void
     */
    public function handleStarted(Event $event, $param)
    {
        global $JSINFO;
        global $ID;
        global $conf;

        $enabled = (int)$this->getConf('enabled') ? 1 : 0;
        $collapselists = (int)$this->getConf('collapselists') ? 1 : 0;
        $remember = (int)$this->getConf('remember') ? 1 : 0;
        $autoexpandCurrent = (int)$this->getConf('autoexpand_current') ? 1 : 0;

        $openlevels = (int)$this->getConf('openlevels');
        if ($openlevels < 1) {
            $openlevels = 1;
        }
        if ($openlevels > 5) {
            $openlevels = 5;
        }

        $sidebar = '';
        if (!empty($conf['sidebar'])) {
            $nearest = page_findnearest($conf['sidebar']);
            if ($nearest !== false) {
                $sidebar = $nearest;
            }
        }

        $JSINFO['collapsesidebarcontent'] = [
            'enabled' => $enabled,
            'collapselists' => $collapselists,
            'openlevels' => $openlevels,
            'remember' => $remember,
            'autoexpand_current' => $autoexpandCurrent,
            'sidebar' => $sidebar,
            'pageurl' => wl($ID),
        ];
    }
}
