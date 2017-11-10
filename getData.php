<?php
  session_start();

  include($_SERVER["DOCUMENT_ROOT"]."/code/php/AC.php");
  $user_name = check_logged(); /// function checks if visitor is logged.
  $admin = false;

  if ($user_name == "") {
      return;
  }

  $permissions = list_permissions_for_user( $user_name );

  $sites = [];
  foreach($permissions as $perm) {
      $el = explode("Site", $perm);
      if ( count($el) == 2 && !in_array($el[1], $sites)) {
          $sites[] = $el[1];
      }
  }

  $tokens = json_decode(file_get_contents($_SERVER["DOCUMENT_ROOT"]."/code/php/tokens.json"),true);

  if (isset($_GET['action']) && $_GET['action'] == "eventMapping") {
      $erg = array();
      // we only need to do this for a single site
      foreach ($sites as $site) {
          $t = null;
          foreach($tokens as $tsite => $token) {
              if ($tsite == $site) {
                  $t = $token;
                  break;
              }
          }
          if ($t == null) { // don't do anything if we cannot find this site
              continue;
          }
          
          $data = array(
              'token' => $t,
              'content' => 'formEventMapping',
              'format' => 'json',
              'returnFormat' => 'json'
          );
          $ch = curl_init();
          curl_setopt($ch, CURLOPT_URL, 'https://abcd-rc.ucsd.edu/redcap/api/');
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
          curl_setopt($ch, CURLOPT_VERBOSE, 0);          
          curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
          curl_setopt($ch, CURLOPT_AUTOREFERER, true);
          curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
          curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
          curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1);
          curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data, '', '&'));
          $output = curl_exec($ch);
          $description = json_decode($output, true);
          curl_close($ch);
          foreach($description as $desc) {
              $erg[] = $desc;
          }
          break; // we only need to run this for a single site
      }
      echo(json_encode($erg));
      return;
  } else if (isset($_GET['action']) && $_GET['action'] == "dataDictionary") {
      $erg = array();
      // we only need to do this for a single site
      foreach ($sites as $site) {
          $t = null;
          foreach($tokens as $tsite => $token) {
              if ($tsite == $site) {
                  $t = $token;
                  break;
              }
          }
          if ($t == null) { // don't do anything if we cannot find this site
              continue;
          }
          
          $data = array(
              'token' => $t,
              'content' => 'metadata',
              'format' =>  'json',
              'returnFormat' => 'json'
          );
          $ch = curl_init();
          curl_setopt($ch, CURLOPT_URL, 'https://abcd-rc.ucsd.edu/redcap/api/');
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
          curl_setopt($ch, CURLOPT_VERBOSE, 0);          
          curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
          curl_setopt($ch, CURLOPT_AUTOREFERER, true);
          curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
          curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
          curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1);
          curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data, '', '&'));
          $output = curl_exec($ch);
          $description = json_decode($output, true);
          curl_close($ch);
          echo(json_encode($description));
          return;
      }
  } else if (isset($_GET['action']) && $_GET['action'] == "instrumentNames") {
      $erg = array();
      // we only need to do this for a single site
      foreach ($sites as $site) {
          $t = null;
          foreach($tokens as $tsite => $token) {
              if ($tsite == $site) {
                  $t = $token;
                  break;
              }
          }
          if ($t == null) { // don't do anything if we cannot find this site
              continue;
          }
          
          $data = array(
              'token' => $t,
              'content' => 'instrument',
              'format' =>  'json',
              'returnFormat' => 'json'
          );
          $ch = curl_init();
          curl_setopt($ch, CURLOPT_URL, 'https://abcd-rc.ucsd.edu/redcap/api/');
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
          curl_setopt($ch, CURLOPT_VERBOSE, 0);          
          curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
          curl_setopt($ch, CURLOPT_AUTOREFERER, true);
          curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
          curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
          curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1);
          curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data, '', '&'));
          $output = curl_exec($ch);
          $description = json_decode($output, true);
          curl_close($ch);
          echo(json_encode($description));
          return;
      }
  } else if (isset($_GET['action']) && $_GET['action'] == "participants") {
      $erg = array();
      // we only need to do this for a single site
      foreach ($sites as $site) {
          $t = null;
          foreach($tokens as $tsite => $token) {
              if ($tsite == $site) {
                  $t = $token;
                  break;
              }
          }
          if ($t == null) { // don't do anything if we cannot find this site
              continue;
          }
          
          $data = array(
            'token' => $t,
            'content' => 'record',
            'format' => 'json',
            'type' => 'flat',
            'fields' => array('enroll_total','id_redcap','redcap_event_name','asnt_timestamp', 'pilot_subject'),
            'events' => array('baseline_year_1_arm_1'),
            'rawOrLabel' => 'raw',
            'rawOrLabelHeaders' => 'raw',
            'exportCheckboxLabel' => 'false',
            'exportSurveyFields' => 'false',
            'exportDataAccessGroups' => 'true',
            'returnFormat' => 'json'
          );
          $ch = curl_init();
          curl_setopt($ch, CURLOPT_URL, 'https://abcd-rc.ucsd.edu/redcap/api/');
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
          curl_setopt($ch, CURLOPT_VERBOSE, 0);          
          curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
          curl_setopt($ch, CURLOPT_AUTOREFERER, true);
          curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
          curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
          curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1);
          curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data, '', '&'));
          $output = curl_exec($ch);
          $description = json_decode($output, true);
          curl_close($ch);
          foreach($description as $desc) {
              $desc['redcap_data_access_group'] = $site;
              $erg[] = $desc;
          }
      }
      //file_put_contents('/tmp/bla.json', json_encode($erg, JSON_PRETTY_PRINT));
      // lets not return the values for one site first,
      // lets mix them up so we will get participants from all sites in the first iteration
      shuffle($erg);
      echo(json_encode($erg));
      return;
  } else if (isset($_GET['action']) && $_GET['action'] == "chunk") {
      $thisChunk = array();
      // get the list of pGUIDs for this chunk
      if (isset($_POST['pGUIDs'])) {
          $thisChunk = json_decode($_POST['pGUIDs']);
      } else { // don't do anything if we don't have the data
          return;
      }
      
      $erg = array();
      // we only need to do this for a single site
      foreach ($sites as $site) {
          $t = null;
          foreach($tokens as $tsite => $token) {
              if ($tsite == $site) {
                  $t = $token;
                  break;
              }
          }
          if ($t == null) { // don't do anything if we cannot find this site
              continue;
          }
          
          $data = array(
              'token' => $t,
              'content' => 'record',
              'format' => 'json',
              'type' => 'flat',
              'records' => $thisChunk,
              'events' => array('baseline_year_1_arm_1'),
              'rawOrLabel' => 'raw',
              'rawOrLabelHeaders' => 'raw',
              'exportCheckboxLabel' => 'false',
              'exportSurveyFields' => 'false',
              'exportDataAccessGroups' => 'true',
              'returnFormat' => 'json'
          );
          $ch = curl_init();
          curl_setopt($ch, CURLOPT_URL, 'https://abcd-rc.ucsd.edu/redcap/api/');
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
          curl_setopt($ch, CURLOPT_VERBOSE, 0);          
          curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
          curl_setopt($ch, CURLOPT_AUTOREFERER, true);
          curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
          curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
          curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1);
          curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data, '', '&'));
          $output = curl_exec($ch);
          $description = json_decode($output, true);
          curl_close($ch);
          foreach($description as $desc) {
              $desc['redcap_data_access_group'] = $site; // add back the data access group (site)
              $erg[] = $desc;
          }
      }
      echo(json_encode($erg));
      return;
  }


?>