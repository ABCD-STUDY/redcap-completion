<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="../../favicon.ico">
    

<?php
session_start();

include($_SERVER["DOCUMENT_ROOT"]."/code/php/AC.php");
$user_name = check_logged(); /// function checks if visitor is logged.
$admin = false;

if ($user_name == "") {
    // user is not logged in
    return;
} else {
    if ($user_name == "admin") {
        $admin = true;
    }
    echo('<script type="text/javascript"> user_name = "'.$user_name.'"; </script>'."\n");
    echo('<script type="text/javascript"> admin = '.($admin?"true":"false").'; </script>'."\n");
}

$permissions = list_permissions_for_user( $user_name );
//echo (json_encode($permissions));
// find the first permission that corresponds to a site
// Assumption here is that a user can only add assessment for the first site he has permissions for!
$site = "";
foreach ($permissions as $per) {
    $a = explode("Site", $per); // permissions should be structured as "Site<site name>"

    if (count($a) > 1) {
        //echo(json_encode($a) . "Count: " . count($a));
        $site = $a[1];
        break;
    }
}
if ($site == "") {
    echo (json_encode ( array( "message" => "Error: no site assigned to this user" ) ) );
    return;
}
$tp = getUserVariable( $user_name, "completeness_last_timepoint" );
if ($tp === FALSE) {
    $tp = 'baseline_year_1_arm_1';
    setUserVariable( $user_name, "completeness_last_timepoint", $tp );
}
echo('<script type="text/javascript"> timepoint = "'.$tp.'"; </script>'."\n");

?>

    <title>Item Level Completion Status of ABCD Instruments</title>
    
    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom styles for this template -->
    <link href="css/sticky-footer-navbar.css" rel="stylesheet">

    <link href="css/style.css" rel="stylesheet">
  </head>
  
  <body>
    
    <!-- Fixed navbar -->
    <nav class="navbar navbar-toggleable-md navbar-inverse fixed-top bg-inverse">
      <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
	<span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand" href="#">Item Level Completion status of ABCD instruments</a>
      <div class="collapse navbar-collapse" id="navbarCollapse">
	<ul class="navbar-nav mr-auto">
	  <li class="nav-item">
	    <a class="nav-link" href="https://abcd-report.ucsd.edu" title="Back to abcd-report page">Home</a>
	  </li>

      <li class="dropdown">
    <a href="#" class="dropdown-toggle nav-link" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Event <span style="color: red;">(NEW)</span><span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li class="nav-item"><a class="nav-link switch-event" style="color: black;" value="baseline_year_1_arm_1" href="#">baseline_year_1_arm_1</a></li>
                <li class="nav-item"><a class="nav-link switch-event" style="color: black;" value="6_month_follow_up_arm_1" href="#">6_month_follow_up_arm_1</a></li>
                <li class="nav-item"><a class="nav-link switch-event" style="color: black;" value="1_year_follow_up_y_arm_1"  href="#">1_year_follow_up_y_arm_1</a></li>
              </ul>
      </li>
      <li class="dropdown">
              <a href="#" class="dropdown-toggle nav-link" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Sort by<span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li class="nav-item"><a class="nav-link" style="color: black;" onclick="sortSiteData( 'similarity' );" href="#">Completeness</a></li>
                <li class="nav-item"><a class="nav-link" style="color: black;" onclick="sortSiteData( 'date' );" href="#">Date</a></li>
              </ul>
      </li>
      <li class="dropdown">
              <a href="#" class="dropdown-toggle nav-link" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Map <span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li class="nav-item"><a class="nav-link" style="color: black;" onclick="dimensionalEmbedding();" href="#">Participants</a></li>
                <li class="nav-item"><a class="nav-link" style="color: black;" onclick="dimensionalEmbedding2();" href="#">Instruments</a></li>
              </ul>
      </li>

	</ul>
      </div>
    </nav>
    
    <!-- Begin page content -->
    <div class="container-fluid" style="margin-top: 80px;">
  	  <span class="text-muted">A data collection instrument is considered complete if every visible measure has a value. A measure is visible if it is not hidden by branching logic.</span>
      <div style="margin-top: 10px;"><button id="runOne" class="btn btn-primary" style="display: none;">Collect data from ABCD <span id="status"></span></button></div>
      <div id="completeness" style="line-height: 0.5;"></div>
    </div>

    <div id="waiting"></div>
    
    <footer class="footer">
      <div class="container">
      </div>
    <div style="position: fixed; bottom: 10px; width: 100%; background-color: rgba(255,255,255,0.8); line-height: 2em;"><span id="message" style="margin-left: 20px; font-size: 23px;"><i>A service provided by the Data Analysis and Informatics Core of ABCD</i></span></div>
    </footer>
    
    
    <!-- Bootstrap core JavaScript
         ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script   src="https://code.jquery.com/jquery-3.1.1.min.js"   integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8="   crossorigin="anonymous"></script>
    <script>window.jQuery || document.write('<script src="../../assets/js/vendor/jquery.min.js"><\/script>')</script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
      <script src="js/bootstrap.min.js"></script>
      <!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
      <script src="js/ie10-viewport-bug-workaround.js"></script>
    <script src="js/peg-0.10.0.min.js"></script>
    <script src="//d3js.org/d3.v3.min.js"></script>
    <script src="js/tsne.js"></script>
    <script src="js/app2.js"></script>
  </body>
</html>

