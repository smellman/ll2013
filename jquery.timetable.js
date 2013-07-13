/*!
 * jQuery Festival Timetable Plugin
 * https://github.com/malde/jquery-timetable
 *
 * Copyright 2013 Malte Klemke
 * Released under the MIT license
 */
;(function ($, window, document, undefined) {

    var pluginName = "timetable",
        defaults = {
            firstHour: 12,
            lastHour: 2,
            file: ''
        },
        _storageKey = "jq.festival.timetable",
        _selectedArtists = [],
        _totalHours = 0;

    function Plugin(element, options) {
        this.element = element;

        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    var _calcWidth = function (duration, opts) {
        var hourWidth = ($('#timetable').width() / _totalHours) - 1;

        var fiveMinuteWidth = (hourWidth / 60) * 5;

        return ((((duration / 5) * fiveMinuteWidth) - 11) / $('#timetable').width()) * 100;
    };

    var _calcOffset = function (time, opts) {
        var hourWidth = ($(document).width() / _totalHours) - 1;

        var fiveMinuteWidth = (hourWidth / 60) * 5;

        var timearray = time.split(':');
        var hours = parseInt(timearray[0], 10),
            minutes = parseInt(timearray[1], 10);

        hours = hours < opts.firstHour ? hours + 24 : hours;

        return (((hours * hourWidth + (minutes / 5) * fiveMinuteWidth) - (opts.firstHour * hourWidth)) / $(document).width()) * 100;
    };

    var _loadFromStore = function() {
        var storedValue = localStorage.getItem(_storageKey);
        return JSON.parse(storedValue) || [];
    };

    var _saveToStore = function(value) {
        localStorage.setItem(_storageKey, JSON.stringify(value));
    };

    var _toggleArtist = function(artistId) {
        var artists = _loadFromStore();
        var index = artists.indexOf(artistId);
        var selected = true;
        if (index > -1) {
            selected = false;
            artists.splice(index, 1);
            _saveToStore(artists);
        }
        else {
            artists.push(artistId);
            _saveToStore(artists);
        }

        $('#'+artistId).toggleClass('selected');
        $('input[value="'+artistId+'"]').prop('checked', selected);
    };

    Plugin.prototype = {

        init: function () {
            var plugin = this;
            _selectedArtists = _loadFromStore();
            _totalHours = plugin.options.lastHour < 24 && plugin.options.lastHour < plugin.options.firstHour ? (plugin.options.lastHour + 24) - plugin.options.firstHour :
                plugin.options.lastHour - plugin.options.firstHour;
	    console.log(_totalHours);

            var src = plugin.options.file;
            $.getJSON(src, function (json) {
                var $headline = $('<h1/>').append(json.name);
                var $selections = plugin.createSelection(plugin.element, plugin.options, json);
                var $festival = plugin.createFestival(plugin.element, plugin.options, json);

                //$(plugin.element).append($headline).append($selections).append($festival);
		$(plugin.element).append($festival);
            });
        },

        createSelection: function (el, options, festival) {
            var $checkboxes = $('<div/>').addClass('selections');

            var days = festival.days;

            for (var i = 0; i < days.length; i++) {
                var stages = days[i].stages;

                for (var j = 0; j < stages.length; j++) {
                    var artists = stages[j].artists;

                    for (var h = 0; h < artists.length; h++) {
                        var artist = artists[h];

                        var $input = $('<input/>').attr('type', 'checkbox').attr('value', artist.id);
                        if (_selectedArtists.indexOf(artist.id) > -1) {
                            $input.prop('checked', true);
                        }
                        $input.change(function (e) {
                            var val = $(this).val();
                            _toggleArtist(val);
                        });

                        var $label = $('<label/>').append($input).append(artist.name);
                        $checkboxes.append($label);
                    }
                }
            }

            return $checkboxes;
        },

        createFestival: function (el, options, festival) {
            var days = festival.days;

            var $div = $('<div/>').addClass('festival');

            for (var i = 0; i < days.length; i++) {
                var day = days[i];
                var $day = this.createDay(el, options, day);

                $div.append($day);
            }

            return $div;
        },

        createDay: function (el, options, day) {
            var stages = day.stages;
            var $day = $('<fieldset/>').addClass('day');
            //var $legend = $('<legend/>').append(day.name);
            //$day.append($legend);

            var $times = this.createTimes(el, options);
            $day.append($times);

            for (var i = 0; i < stages.length; i++) {
                var stage = stages[i];
                var $stage = this.createStage(el, options, stage);

                $day.append($stage);
            }

            return $day;
        },

        createTimes: function (el, options) {
            var $times = $('<div/>').addClass('times');

            for (var i = options.firstHour + 1; i < options.lastHour; i++) {
                var time = (i > 24 ? i - 24 : (i == 24 ? '00' : i)) + ':00';
                var offset = _calcOffset(time, options);

                var $time = $('<div/>').append(time).css({
                    'left': offset + '%'
                }).addClass('time');

                $times.append($time);
            }

            return $times;
        },

        createStage: function (el, options, stage) {
            var artists = stage.artists;

            var $div = $('<div/>').addClass('stage').addClass(stage.id);
            $div.append(stage.name);

            for (var i = 0; i < artists.length; i++) {
                var artist = artists[i];
                var $artist = this.createArtist(el, options, artist);

                $div.append($artist);
            }

            return $div;
        },

        createArtist: function (el, options, artist) {
	    var moveLeft = 20;
	    var moveDown = 10;
            var offset = _calcOffset(artist.time, options);
            var width = _calcWidth(artist.duration, options);
	    var link_to = $('<a/>').attr('href', '#' + artist.link).text(artist.name);

            var $div = $('<div/>').addClass('artist').attr('id', artist.id).append(link_to).css({
                'width': width + '%',
                'left': offset + '%'
            }).click(function(e) {
                //_toggleArtist(artist.id);
            }).hover(function(e) {
		$('span#table_popup_detail').text(artist.detail);
		$('div#table_popup').show().css('top', e.pageY + moveDown).css('left', e.pageX + moveLeft).appendTo('body');
	    }, function() {
		$('div#table_popup').hide();
	    }).mousemove(function(e) {
		$('div#table_popup').css('top', e.pageY + moveDown).css('left', e.pageX + moveLeft);
	    });
            if (_selectedArtists.indexOf(artist.id) > -1) {
                $div.addClass('selected');
            }

            return $div;
        }

    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
