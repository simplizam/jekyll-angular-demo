/**
	*  Module: MapCtrl
	*
	* Description
	*/
	angular.module('myApp', ['google-maps'], function($interpolateProvider) {
		$interpolateProvider.startSymbol('//');
   		$interpolateProvider.endSymbol('//');

		})
		.controller('MapCtrl', function($scope, $window, $log, $sce, $timeout, $http){

			$http({method: 'GET', url: 'http://geoportal-geoportail.gc.ca/arcgis/rest/services/Reported_Observations_Aquatic_Invasive_Species_ENG/MapServer/layers?f=pjson'}).
			  success(function(data, status, headers, config) {
			  	$log.log(status);
			  	// remove underscore from names

			    (function(){
			    	data.layers.forEach(function(layer){
			    		layer.name = layer.name.split('_').join(' ').toLowerCase();
			    	})
				})();

			    $scope.data = data;
			    

			    // fix async

			 	$scope.map = {
				    center: {
				    latitude: 60.569345, 
	                longitude: -98.6327884
				    },
				    zoom: 4,
				    showMap: []
				};

				$scope.bounds =  {
		            sw: {
		                latitude: 48.444900000000075,
		                longitude: -123.43288299999995
		            },
		            ne: {
		                latitude: 49.31563300000005,
		                longitude: -123.13224399999996
		            	}
		        };  
			  }).
			  error(function(data, status, headers, config) {
			    $log.log("couldn't fetch JSON");
			  });

			
			

			$scope.getBounds = function (id) {
				if($scope.data.layers[id].extent) {
					var bounds = {
			            sw: {
			                latitude: $scope.data.layers[id].extent.ymin,
			                longitude: $scope.data.layers[id].extent.xmin
			            },
			            ne: {
			                latitude: $scope.data.layers[id].extent.ymax,
			                longitude: $scope.data.layers[id].extent.xmax
			            }
			        };
					$scope.boundsArray.push(bounds);
				} else {
					return "unknown";
				};
			};

			$scope.map = {
			    center: {
			    latitude: 48.444900000000075,
                longitude: -123.43288299999995
			    },
			    zoom: 8
			};
			$scope.bounds =  {
		            sw: {
		                latitude: 0,
		                longitude: 0
		            },
		            ne: {
		                latitude: 4,
		                longitude: 4
		            }
		        };  
		    $scope.boundsArray = [];
		    $scope.wikiArray = [];

		    $scope.getWiki = function(id) {

		    	$scope.getWhen = function (id) {
					if($scope.data.layers[id].timeInfo.timeExtent) {
						var date = new Date($scope.data.layers[id].timeInfo.timeExtent[0]);
						return date.getFullYear()
					} else {
						return "unknown";
					};
				};
		    	
		    	// get year invaded
		    	$scope.whenInvaded = "Year Invaded: " + $scope.getWhen(id); 
		    	// get new map center and zoom
		    	$scope.map.center = {
			                			latitude: ($scope.data.layers[id].extent.ymin + $scope.data.layers[id].extent.ymax)/2,
			                			longitude: ($scope.data.layers[id].extent.xmin + $scope.data.layers[id].extent.xmax)/2
			            			};
			    $scope.map.zoom = 7;


		    	if($scope.wikiArray[id]){
		    		$scope.wikiHTML = $sce.trustAsHtml($scope.wikiArray[id].toString());
		    	}
		    	else {
		    		$http({method: 'GET', url: 'https://cors-anywhere.herokuapp.com/http://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles='+ $scope.data.layers[id].name}).
					success(function(data, status, headers, config) {
				  		$log.log(status);

				  		for (var pageId in data.query.pages) {
						    if (data.query.pages.hasOwnProperty(pageId) && (data.query.pages[pageId].extract != undefined) && (data.query.pages[pageId].extract != "")) {
						        $scope.wiki = data.query.pages[pageId].extract;
						        $scope.wikiHTML = $sce.trustAsHtml($scope.wiki);
						        $scope.wikiArray = [];
						        $scope.wikiArray[id] = $scope.wikiHTML;
						    } else {
						    	$log.log("couldnt get extract");
						    	$scope.wiki = "Couldn't find Wikipedia Article"
						        $scope.wikiHTML = $sce.trustAsHtml($scope.wiki);
						        $scope.wikiArray[id] = $scope.wikiHTML;
						    }
						}
					   		
				   	}). 
				  	error(function(data, status, headers, config) {
				    	$log.log("couldn't fetch JSON");
				  	});
			 	};
		    	}

			    
			  



			
	})