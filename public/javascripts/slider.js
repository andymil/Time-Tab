var $slider, 
	$sliders,
	slider = new angular.module("slider", []);

angular.element(document).ready(function() {
	$slider = angular.element("#slider #sliders");
	$sliders = angular.element("> div:first", $slider);

	angular.element("[rel='tooltip']").tooltip();
	angular.element(".popover").popover();
	angular.element("body").removeClass("preload");
});

slider.directive("recordCreater", function($document) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var record = {}, 
				mousedown = false,
				r = {mouseClickX: 0, mouseCurrentX: 0, recordX: 0, recordWidth: 0};

			element.on("mousedown", function(event) {
				var recordActivity = scope.getActivity(scope.activities.value.name);;

				scope.day.records.push({
					position: event.pageX - $sliders.offset().left,
					activity: recordActivity,
					width: 0,
					created: false,
					time: ""
				});

				record = scope.day.records[scope.day.records.length - 1];
				r.mouseClickX = event.pageX - $sliders.offset().left;
				scope.$apply();

				mousedown = true;
			});

			$document.on("mousemove", function(event) {
				if (mousedown) {
					r.mouseCurrentX = event.pageX - $sliders.offset().left;

					if (r.mouseCurrentX - r.mouseClickX < 0) {
						record.position = Math.max(r.mouseCurrentX - r.mouseCurrentX % 15 - 15, 0);
						record.width = r.mouseClickX - record.position - r.mouseClickX % 15;
					} else {
						record.position = r.mouseClickX - r.mouseClickX % 15;
						record.width = r.mouseCurrentX - r.mouseClickX - (r.mouseCurrentX - r.mouseClickX) % 15 + 15;
					}

					scope.updateTimePointers(record, scope.$dayIndex);
					scope.timeTeller.hidden = true;
					record.time = ("0" + Math.floor(record.width / 3 / 60)).slice(-2) + ":" + ("0" + Math.floor(record.width / 3 % 60)).slice(-2);
					scope.$apply();
				}
			}).on("mouseup", function(event) {
				mousedown = false;
				scope.hideTimePointers();
				record.created = true;
				scope.$apply();
			});
		}
	}
});

slider.directive("recordResizer", function($document) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var record = {}, 
				mousedown = false,
				r = {
					mouseClickX: 0,
					mouseCurrentX: 0,
					recordX: 0,
					recordWidth: 0,
					recordMousedownPosition: 0,
					resizeOffset: 0,
					recordMousedownWidth: 0
				};

			element.on("mousedown", function(event) {
				record = scope.record;
				r.mouseClickX = event.pageX - $sliders.offset().left;
				r.recordMousedownPosition = record.position;
				r.recordMousedownWidth = record.width;
				r.resizeOffset = r.mouseClickX - record.position - (element.attr('class') == "drag-right" ? record.width : 0);
				mousedown = true;
			});

			$document.on("mousemove", function(event) {
				if (mousedown) {
					r.mouseCurrentX = event.pageX - $sliders.offset().left;

					if (element.attr('class') == "drag-right") {
						if (r.mouseCurrentX - r.mouseCurrentX % 3 - r.resizeOffset > r.recordMousedownPosition) {
							record.position = r.recordMousedownPosition;
							record.width = r.mouseCurrentX - r.recordMousedownPosition - r.mouseCurrentX % 3 - r.resizeOffset;
						} else {
							record.position = r.mouseCurrentX - r.mouseCurrentX % 3 - r.resizeOffset;
							record.width = r.recordMousedownPosition - r.mouseCurrentX + r.mouseCurrentX % 3 + r.resizeOffset;
						}
					} else {
						if (r.recordMousedownPosition + r.recordMousedownWidth - r.mouseCurrentX + r.resizeOffset > 0) {
							record.position = r.mouseCurrentX - r.mouseCurrentX % 3 - r.resizeOffset;
							record.width = r.recordMousedownWidth + r.mouseClickX - r.mouseCurrentX + r.mouseCurrentX % 3;
						} else {
							record.position = r.recordMousedownPosition + r.recordMousedownWidth;
							record.width = r.mouseCurrentX - r.mouseCurrentX % 3 - r.recordMousedownPosition - r.recordMousedownWidth - r.resizeOffset;
						}
					}

					scope.updateTimePointers(record, scope.$dayIndex);
					scope.timeTeller.hidden = true;
					record.time = ("0" + Math.floor(record.width / 3 / 60)).slice(-2) + ":" + ("0" + Math.floor(record.width / 3 % 60)).slice(-2);
					scope.$apply();
				}
			}).on("mouseup", function(event) {
				mousedown = false;
			});
		}
	}
});

slider.directive('tooltip', function() {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			element.attr("title", scope.group.clients.join("<br>")).tooltip({placement: "right", html: true});
		}
	}
});

slider.controller("slider", function($scope) {
	$scope.settings = {
		currency: "$"
	};

	// $scope.timeRegex = /[0-9]{0,2}:[0-9]{0,2}/;
	// $scope.timeRegex = /(0?[0-9]|[0-5][0-9]):(0?[0-9]|[0-5][0-9])/;
	$scope.timeRegex = /[0-5]{0,2}::[0-5]{0,2}/;

	$scope.colors = [
		{name: "Red", hex: "#DC2127"},
		{name: "Green", hex: "#51B749"},
		{name: "Yellow", hex: "#FBD75B"},
		{name: "Blue", hex: "#5484ED"},
		{name: "Light Blue", hex: "#9FC6E7"},
		{name: "Purple", hex: "#DBADFF"},
		{name: "salmon", hex: "#FF887C"},
		{name: "grey", hex: "#E1E1E1"},
	];

	$scope.currencies = ["$", "€", "¥", "£", "฿"];

	$scope.groups = {
		groups: [
			{
				name: "Time Tab",
				clients: ["john.smith@gmail.com", "tim.tom@gmail.com"],
				categories: [
					{
						name: "work",
						activities: [
							{
								name: "python",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#DC2127"
							},
							{
								name: "java",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#51B749"
							},
							{
								name: "html5",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#FBD75B"
							},
							{
								name: "ruby",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#5484ED"
							},
							{
								name: "django",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#9FC6E7"
							},
							{
								name: "css",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#DBADFF"
							},
							{
								name: "javascript",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#FF887C"
							},
							{
								name: "jQuery",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#E1E1E1"
							}
						]
					},
					{
						name: "gardening",
						activities: [
							{
								name: "planting",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#FBD75B"
							},
							{
								name: "watering",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#DBADFF"
							},
							{
								name: "weed destroying",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#51B749"
							}
						]
					},
					{
						name: "computers",
						activities: [
							{
								name: "mac",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#E1E1E1"
							},
							{
								name: "windows",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#5484ED"
							},
							{
								name: "Linux",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#FBD75B"
							}
						]
					}
				]
			},
			{
				name: "Plumbing",
				clients: ["tits.magee@bangbros.com"],
				categories: [
					{
						name: "gardening",
						activities: [
							{
								name: "mowing",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#DC2127"
							},
							{
								name: "clipping",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#51B749"
							},
							{
								name: "planting",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#FBD75B"
							},
							{
								name: "watering",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#5484ED"
							}
						]
					},
					{
						name: "longboarding",
						activities: [
							{
								name: "sliding",
								hourlyrate: false,
								billable: false,
								currency: "$",
								color: "#FBD75B"
							},
							{
								name: "downhill",
								hourlyrate: false,
								billable: false,
								currency: "$",
								color: "#DBADFF"
							},
							{
								name: "tricks",
								hourlyrate: false,
								billable: false,
								currency: "$",
								color: "#51B749"
							}
						]
					},
				]
			}
		],
		current: {}
	};

	$scope.clients = [
		{name: "John Smith", email: "john.smith@gmail.com"},
		{name: "Barney Stinson", email: "suitup@always.com"},
		{name: "Mother Tereser", email: "tits.magee@bangbros.com"},
		{name: "Tim Tom", email: "tim.tom@gmail.com"},
		{name: "James Bond", email: "james@bond.com"}
	];

	$scope.groups.current = $scope.groups.groups[0];

	$scope.activities = {
		value: $scope.groups.current.categories[0].activities[0],
		values: []
	};

	$scope.sidePanelShow = function(obj) {
		for (var o in obj)
			if (!obj[o]) return false;

		return true
	};

	$scope.hidePanels = function(item) {
		item = item || "";

		item != "activities" ? $scope.panels.activities = true : $scope.panels.activities = !$scope.panels.activities;
		item != "newActivity" ? $scope.panels.newActivity = true : $scope.panels.newActivity = !$scope.panels.newActivity;
		item != "newCategory" ? $scope.panels.newCategory = true : $scope.panels.newCategory = !$scope.panels.newCategory;

		item != "groups" ? $scope.panels.groups = true : $scope.panels.groups = !$scope.panels.groups;
		item != "newGroup" ? $scope.panels.newGroup = true : $scope.panels.newGroup = !$scope.panels.newGroup;

		item != "clients" ? $scope.panels.clients = true : $scope.panels.clients = !$scope.panels.clients;
		item != "newClient" ? $scope.panels.newClient = true : $scope.panels.newClient = !$scope.panels.newClient;

		item != "recordInfo" ? $scope.panels.recordInfo = true : $scope.panels.recordInfo = !$scope.panels.recordInfo
	};

	$scope.panels = {
		activities: true,
		newActivity: true,
		newCategory: true,
		groups: true,
		newGroup: true,
		clients: true,
		newClient: true,
		recordInfo: true
	};

	$scope.date = new Date();
	$scope.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	$scope.recordPopOver = {
		record: {},
		recordCopy: {}
	}

	$scope.showRecordInfo = function(record, day, e) {
		$scope.panels.recordInfo = false;
		$scope.recordPopOver.record = record;
		$scope.recordPopOver.recordCopy = angular.copy(record);
		$scope.recordPopOver.recordCopy.fromFormatTime = 
			("0" + Math.floor($scope.recordPopOver.recordCopy.position / 3 / 60)).slice(-2) + ":" + 
			("0" + Math.floor($scope.recordPopOver.recordCopy.position / 3 % 60)).slice(-2);
		$scope.recordPopOver.recordCopy.toFormatTime = 
			("0" + Math.floor(($scope.recordPopOver.recordCopy.position + $scope.recordPopOver.recordCopy.width) / 3 / 60)).slice(-2) + ":" + 
			("0" + Math.floor(($scope.recordPopOver.recordCopy.position + $scope.recordPopOver.recordCopy.width) / 3 % 60)).slice(-2);
		$scope.recordPopOver.recordCopy.billable = $scope.recordPopOver.recordCopy.activity.billable;
		$scope.recordPopOver.recordCopy.money = $scope.recordPopOver.recordCopy.activity.hourlyrate * ($scope.recordPopOver.recordCopy.width / 3 / 60).toFixed(2);
		$scope.recordPopOver.recordCopy.currency = $scope.recordPopOver.recordCopy.activity.currency;

	};

	$scope.days = [
		{
			name: "sun",
			longName: "Sunday",
			records: []
		}, 
		{
			name: "mon",
			longName: "Monday",
			records: []
		}, 
		{
			name: "tue",
			longName: "Tuesday",
			records: []
		}, 
		{
			name: "wed",
			longName: "Wednesday",
			records: []
		}, 
		{
			name: "thu",
			longName: "Thursday",
			records: []
		}, 
		{
			name: "fri",
			longName: "Friday",
			records: []
		}, 
		{
			name: "sat",
			longName: "Saturday",
			records: []
		}
	];

	$scope.convertTime = function(type, time){
		if(type == 24){
			period = "";
			time += period == "PM" ? 12 : 0;
		}else{
			period = ["AM", "PM", "PM"][Math.floor(time / 12)];
			time = (time + 11) % 12 + 1;
		}

		return {
			time: time,
			formatedTime: ("0" + time).slice(-2) + "00",
			period: period
		}
	}

	$scope.numberOfDays = function(year, month) {
		var d = new Date(year, month, 0);
		return d.getDate();
	}

	$scope.range = function(n) {
        return new Array(n);
    };
});

slider.controller("newActivity", function($scope) {
	$scope.reset = function() {
		$scope.activity = {currency: $scope.settings.currency};
	};

	$scope.create = function() {
		$scope.groups.current.categories.forEach(function(category) {
			category.name == $scope.activity.category ? category.activities.push(angular.copy($scope.activity)) : 0;
		});

		$scope.reset();
	};
});


slider.controller("newCategory", function($scope) {
	$scope.reset = function() {
		$scope.category = {};
	};

	$scope.create = function() {
		$scope.category.activities = [];
		$scope.groups.current.categories.push(angular.copy($scope.category));
		$scope.reset();
	};
});

slider.controller("newClient", function($scope) {
	$scope.reset = function() {
		$scope.client = {};
	};

	$scope.create = function() {
		$scope.client.name = ["James", "Alex", "Jainie", "Taylor", "Jordan"][Math.floor(Math.random() * 5)] + " " + ["Smith", "Jones", "Wilson", "Dover", "Doh"][Math.floor(Math.random() * 5)];
		$scope.clients.push(angular.copy($scope.client));
		$scope.reset();
	};
});

slider.controller("newGroup", function($scope) {
	$scope.reset = function() {
		$scope.group = {clients: []};
	};

	$scope.create = function() {
		$scope.group.clients = $scope.group.clients.filter(function(n) { return n; });
		$scope.groups.groups.push(angular.copy($scope.group));
		$scope.reset();
	};
});

slider.controller("recordInfo", function($scope) {
	$scope.fromFormatedTime = function() {
		console.log($scope.recordPopOver);
	};

	$scope.create = function() {
		// recordPopOver.
		console.log($scope.recordPopOver.recordCopy.fromFormatTime.split(":")[0] * 3 * 60);

		timeRegex.test($scope.recordPopOver.recordCopy.fromFormatTime) && timeRegex.test($scope.recordPopOver.recordCopy.fromFormatTime) && 
		military_time_from.Time >= 0 && military_time_from.Time <= 24 && military_time_to.Time >= 0 && military_time_to.Time <= 24 &&
		from_val[1] < 60 && to_val[1] < 60 &&
		military_time_from.Time * 60 + parseInt(from_val[1]) < military_time_to.Time * 60 + parseInt(to_val[1])
	};

	$scope.delete = function() {
		for (var i = 0; i < $scope.days.length; i++) {
			for (var j = 0; j < $scope.days[i].records.length; j++) {				
				if ($scope.recordPopOver.record == $scope.days[i].records[j]) {
					$scope.days[i].records.splice(j, 1);
					break;
				}
			}
		}
	};
});

slider.controller("sliderOptions", function($scope) {
	$scope.groups.current.categories.forEach(function(category) {
		category.activities[0] && !$scope.activities.value ? $scope.activities.value = category.activities[0] : 0;
		category.activities.forEach(function(activity) {
			$scope.activities.values.push(activity);
		});
	});
});

slider.controller("sliderTimeTracker", function($scope, $element) {
	$scope.timeTeller = {
		hide: function(trueOrFalse) { this.hidden = trueOrFalse || false; },
		hidden: true,
		arrowTop: false,
		day: "",
		left: 0,
		top: 0,
		formatedTime: "00:00"
	};

	$scope.timepointers = [
		{left: 0, top: 0, type: "left", show: false, formatedTime: "00:00"},
		{left: 0, top: 0, type: "right", show: false, formatedTime: "00:00"}
	];

	$scope.getActivity = function(activityName) {
		var desiredActivity;

		$scope.groups.current.categories.forEach(function(category) {
			category.activities.forEach(function(activity) {
				activity.name == activityName ? desiredActivity = activity : 0;
			});
		});

		return desiredActivity;
	};

	$scope.currentDate = new Date();

	+function updateTime(scope, start) {
		scope.currentDate = new Date();
		start || scope.$apply();
		setTimeout(function() { updateTime(scope, false); }, 1000);
	}($scope, true);

	$scope.createRecord = function(day, $event) {
		$scope.creatingRecord = true;

		day.records.push({
			position: $event.pageX - $sliders.offset().left,
			background: $scope.activities.value.color,
			money: null,
			billable: false,
			description: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat.",
			width: 0
		});

		$scope.currentRecord = day.records[day.records.length - 1];
	};

	$scope.updateTimeTeller = function(event) {
		$scope.timeTeller.formatedTime = ("0" + Math.floor((event.pageX - $sliders.offset().left) / 180)).slice(-2) + ":" + ("0" + Math.floor((event.pageX - $sliders.offset().left) / 3 % 60)).slice(-2);

		$scope.timeTeller.left = event.pageX - $slider.offset().left;
		$scope.timeTeller.top = event.pageY - $slider.offset().top;
		$scope.timeTeller.day = $scope.days[Math.floor(100 / $slider.height() * ($scope.timeTeller.top + 1) / (100 / 7))].longName; 
		
		if ($scope.days[$scope.currentDate.getDay()].longName == $scope.timeTeller.day && $scope.currentDate.getHours() * 180 + $scope.currentDate.getMinutes() * 3 <= event.pageX - $sliders.offset().left && $scope.currentDate.getHours() * 180 + $scope.currentDate.getMinutes() * 3 >= event.pageX - $sliders.offset().left - 4) {
			$scope.timeTeller.formatedTime = "The current time is " + ("0" + $scope.currentDate.getHours()).slice(-2) + ":" + ("0" + $scope.currentDate.getMinutes()).slice(-2);
		}

		$("", $element).width()

		$scope.timeTeller.arrowTop = true;
		$scope.timeTeller.top - 70 < 0 ? $scope.timeTeller.top += 105 : $scope.timeTeller.arrowTop = false;
	};

	$scope.updateTimePointers = function(record, day) {
		$scope.timepointers[0].left = Math.max(record.position - 100 + $sliders.offset().left - $slider.offset().left, 20);
		$scope.timepointers[0].type = "left";

		if (record.position - 100 + $sliders.offset().left - $slider.offset().left < 20) {
			$scope.timepointers[0].type = "right";
		}

		$scope.timepointers[0].formatedTime = ("0" + Math.floor(record.position / 3 / 60)).slice(-2) + ":" + ("0" + Math.floor(record.position / 3 % 60)).slice(-2);

		$scope.timepointers[1].left = record.position + record.width + 20 + $sliders.offset().left - $slider.offset().left;
		$scope.timepointers[1].formatedTime = ("0" + Math.floor((record.position + record.width) / 3 / 60)).slice(-2) + ":" + ("0" + Math.floor((record.position + record.width) / 3 % 60)).slice(-2);

		$scope.timepointers.forEach(function(element) {
			element.top = Math.round(day * ($sliders.height() + 1) + $sliders.height() / 2 - 15);
			element.show = true;
		});
	};

	$scope.hideTimePointers = function() {
		$scope.timepointers.forEach(function(element) {
			element.show = false;
		});
	};

});

slider.controller("activities", function($scope) {
});