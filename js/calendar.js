'use strict';

var Calendar = {

	vars: {
		matchDate:      /^(\d+)[-\/\.\s](\d+|[А-Яа-я]+)[-\/\.\s](\d{4})$/,
		daysNames:      'понедельник вторник среда четверг пятница суббота воскресение'.split(' '),
		monthsNames:    'январь февраль март апрель май июнь июль август сентябрь октябрь ноябрь декабрь'.split(' '),
		monthsNamesGen: 'января февраля марта апреля мая июня июля августа сентября октября ноября декабря'.split(' '),
		monthsNums: {
			'янв': 0,
			'фев': 1,
			'мар': 2,
			'апр': 3,
			'май': 4,
			'июн': 5,
			'июл': 6,
			'авг': 7,
			'сен': 8,
			'окт': 9,
			'ноя': 10,
			'дек': 11
		},

		daySelected: null,
		choosedDayIndex: null,
		searchResultArr: {
			prevVal: null,
			prevRes: [],
			newRes: []
		}
	},

	eventData: function () {
		this.title      = '';
		this.date       = '';
		this.normalDate = '';
		this.members    = '';
		this.desc       = '';

		return this;
	},

	cellData: function () {
		this.date           = '',
		this.dayNum         = '',
		this.dayName        = '',
		this.active         = 0,
		this.notCurrMonth   = 0,
		this.event          = {}
	},

	localData: {},

	data: {
		cells: null

		/*
		[
			{
				date: '12-9-2013',              // дата
				normalDate: '12 сентября 2013,  // дата в нормальном виде
				dayNum: 10,                     // сегодняшний день (число)
				dayName: 'понедельник',         // название дня
				active: true,                   // сегодняшний ли день
				notCurrMonth: true,             // не нынешний месяц
				event: {}                       // данные события
			},
		]
		 */
	},

	getData: {

		getEvent: function (date) {
			var data = localStorage[date];

			return data ? JSON.parse(data) : null;
		},


		getDayNum: function (index) {
			return index ? index : 7;
		},

		daysCntInMonth: function (month, year) {
			return new Date(year, month, 0).getDate();
		},

		getDateFormat: function (selectedDate, dayNum) {
			return dayNum +'-'+ selectedDate.month +'-'+ selectedDate.year;
		},

		getDate: function (date) {
			var result = {
				month: date.getMonth() + 1,
				year: date.getFullYear()
			};

			result.daysCnt = this.daysCntInMonth(result.month, result.year);

			if (this.currDate && result.month == this.currDate.month && result.year == this.currDate.year) {
				result.isCurrMonth = 1;
			}

			/*
				{
					month: ,        // месяц
					year: ,         // год
					daysCnt: ,      // кол-во дней в месяце
					isCurrMonth:    // является ли данный месяц "настоящим"
				}
			 */

			return result;
		},

		getDates: function (date) {
			this.selectedDate = this.getDate(date);
			this.prevDate = this.getDate(new Date(this.selectedDate.year, this.selectedDate.month - 1, 0));
			this.nextDate = this.getDate(new Date(this.selectedDate.year, this.selectedDate.month + 1, 0));
		},

		getCurrDate: function () {
			var date = new Date();

			this.currDate = this.getDate(date);
			this.currDate.currDay = this.getDayNum(date.getDate());
		},

		getFirstDayIndex: function () {
			var date = new Date(this.selectedDate.year, this.selectedDate.month - 1, 1);

			this.selectedDate.firstDayIndex = this.getDayNum(date.getDay());
		},

		getDayName: function (cellsCnt) {
			return cellsCnt >= 36 ? Calendar.vars.daysNames[42 - cellsCnt] : null;
		},

		getCurrMonthArray: function () {
			var cellsCnt            = 42,
				resultArr           = [],
				firstCellDayNum     = this.prevDate.daysCnt - this.selectedDate.firstDayIndex + 2;

			var step = 0,
				currDayNum  = firstCellDayNum,
				usedDate    = this.prevDate;

			while (cellsCnt > 0) {
				resultArr.push({
					date: this.getDateFormat(usedDate, currDayNum),
					dayNum: currDayNum,
					dayName: this.getDayName(cellsCnt),
					active: usedDate.isCurrMonth && this.currDate.currDay == currDayNum ? 1 : 0,
					notCurrMonth: step != 1 ? 1 : 0,
					event: this.getEvent(this.getDateFormat(usedDate, currDayNum))
				});

				if (currDayNum != usedDate.daysCnt) {
					currDayNum++;
				} else {
					currDayNum = 1;
					usedDate = !step ? this.selectedDate : this.nextDate;
					step++;
				}

				cellsCnt--;
			}

			return resultArr;
		},

		getThisMonthData: function (date) {
			this.getCurrDate();
			this.getDates(date);
			this.getFirstDayIndex();

			Calendar.data.cells = this.getCurrMonthArray();
		}

	},


	tpl: {

		tplToHtml: function (tpl, data) {
			var templateHtml    = Calendar.options[tpl].html(),
				template        = Handlebars.compile(templateHtml),
				html            = template(data);

			return html;
		},

		makeHtml: function (wrapper, tpl, data) {
			var html    = this.tplToHtml(tpl, data).trim(),
				$wrap   = Calendar.options[wrapper];

			$wrap.html(html);

			if (html) $wrap.show();
		}

	},


	calendar: {

		getMonthNum: function (monthName) {
			return Calendar.vars.monthsNums[monthName.slice(0,3)];
		},

		makeNormalDate: function (date /* 12-9-2013 */, genitive) {
			var dateArr = date.split('-'),
				month = dateArr[1]- 1,
				month = genitive ? Calendar.vars.monthsNamesGen[month] : Calendar.vars.monthsNames[month];

			return dateArr[0] +' '+ month +' '+ dateArr[2];
		},

		setSelectedMonth: function () {
			var selectedDate = Calendar.getData.selectedDate,
				choosedData = Calendar.vars.monthsNames[selectedDate.month-1] +' '+ selectedDate.year;

			Calendar.options.choosedDate.html(choosedData);
		},

		changeMonthData: function (date) {
			Calendar.getData.getThisMonthData(date);
			this.setSelectedMonth();
			Calendar.tpl.makeHtml('wrapper', 'dayTpl', Calendar.data);
		},

		changeMonth: function (step) {
			var dateData = step > 0 ? Calendar.getData.nextDate : Calendar.getData.prevDate,
				date = new Date(dateData.year, dateData.month, 0);

			this.changeMonthData(date);
		},

		goCurrMonth: function () {
			Calendar.getData.getThisMonthData(new Date());
			Calendar.tpl.makeHtml('wrapper', 'dayTpl', Calendar.data);
		},

		selectDay: function ($obj) {
			this.unselectDay();

			setTimeout(function () {
				$obj.addClass(Calendar.options.selectedItem);
			}, 30);
		},

		unselectDay: function () {
			$('.'+ Calendar.options.selectedItem).removeClass(Calendar.options.selectedItem);
		}

	},


	events: {

		isValidFormDate: function (date) {
			var matches = date.match(Calendar.vars.matchDate);

			if (matches == null) return false;

			var d = matches[1],
				m = matches[2],
				m = isNaN(+m) ? Calendar.calendar.getMonthNum(m) : m - 1,
				y = matches[3],
				composedDate = new Date(y, m, d);

			if (
				composedDate.getDate() == d &&
				composedDate.getMonth() == m &&
				composedDate.getFullYear() == y
			) {
				return d +'-'+ (m + 1) +'-'+ composedDate.getFullYear();
			} else {
				return false;
			}
		},

		changeDateFormat: function (date) {
			var matches = date.match(Calendar.vars.matchDate);

			return matches[1] +'-'+ (Calendar.calendar.getMonthNum(matches[2]) + 1) +'-'+ matches[3];
		},

		getDataFormatDate: function (date) {
			return /\d+\-\d+\-\d{4}/.exec(date) ? date : this.changeDateFormat(date);
		},

		showFormError: function () {
			// TODO вывод ошибки формата даты в форме
		},

		openEvent: function ($obj) {
			var date = $obj.attr('data-date'),
				data = localStorage[date],
				data = data ? JSON.parse(data) : {title: '', date: date, members: '', desc: ''};

			Calendar.vars.choosedDayIndex = $obj.index();
			Calendar.tpl.makeHtml('overlay', 'eventTpl', data);
			Calendar.options.overlay.show();
		},

		getCellData: function (date) {
			var $cell   = $(Calendar.options.item +'[data-date='+ date +']'),
				index   = $cell.index();

			return Calendar.data.cells[Calendar.vars.choosedDayIndex ? Calendar.vars.choosedDayIndex : index];
		},

		getFormData: function (date) {
			var $form       = $(Calendar.options.eventForm),
				eventData   = new Calendar.eventData(),
				cellData    = this.getCellData(date);

			Calendar.vars.choosedDayIndex == null;
			if (!cellData.event) cellData.event = {};

			for (var i in eventData) {
				var val = $form.find('[name='+ i +']').val()
					val = i != 'date' ? val : this.getDataFormatDate(val);

				eventData[i] = val;
				cellData[i] = val;
				cellData.event[i] = val;
			}

			var _date = eventData.date,
				_date = Calendar.calendar.makeNormalDate(_date, 1);

			eventData.normalDate = _date;
			cellData.event.normalDate = _date;

			return [eventData, cellData];
		},

		saveEvent: function () {
			var date = $(Calendar.options.eventForm).find('[name=date]').val().trim(),
				date = this.isValidFormDate(date);

			if (!date) return this.showFormError('date');

			var data = this.getFormData(date),
				html = Calendar.tpl.tplToHtml('dayTpl', {cells: [data[1]]});

			this.updateLocalData(data[0]);
			localStorage.setItem(date, JSON.stringify(data[0]));

			$(Calendar.options.item +'[data-date='+ date +']').replaceWith(html);
			this.closeEvent();
		},

		clearCellHtml: function (date) {
			var o       = Calendar.options,
				$cell   = $(Calendar.options.item +'[data-date='+ date +']');

			$cell.find(o.itemTitle).html('');
			$cell.find(o.itemMembers).html('');
			$cell.attr('class', o.itemClass);
		},

		deleteEvent: function () {
			var date = $(Calendar.options.eventForm).find('[name=date]').val().trim(),
				date = this.isValidFormDate(date);

			if (!date) return this.showFormError('date');

			localStorage.removeItem(date);
			delete Calendar.localData[date];

			this.clearCellHtml(date);
			this.closeEvent();
		},

		closeEvent: function () {
			Calendar.calendar.unselectDay();
			Calendar.options.overlay.hide().html('');
		},

		updateLocalData: function (data) {
			if (!Calendar.localData[data.date]) {
				Calendar.localData[data.date] = {};
			}

			for (var i in data) {
				Calendar.localData[data.date][i] = data[i];
			}
		}

	},


	search: {

		makeResultsHtml: function () {
			var data = [],
				result = Calendar.vars.searchResultArr.prevRes;

			for (var i in result) {
				data.push({});

				var lastEl = data[data.length-1];

				for (var k in Calendar.localData[i]) {
					lastEl[k] = Calendar.localData[i][k];
				}

				lastEl.dataDate = lastEl.date;

				var _date = Calendar.localData[i].date,
					_date = Calendar.calendar.makeNormalDate(_date, 1);

				lastEl.date = _date;
			}

			Calendar.tpl.makeHtml('searchResult', 'searchTpl', {results: data});
		},

		clearResults: function () {
			$(Calendar.options.searchResult).html('').hide();
		},

		showResults: function () {
			if (!Calendar.options.searchField.val()) return;

			setTimeout(function () {
				$(Calendar.options.searchResult).show();
			}, 100);
		},

		hideResults: function () {
			$(Calendar.options.searchResult).hide();
		},

		pullEvents: function (val, e) {
			var val     = val.toLowerCase().trim(),
				resData = Calendar.vars.searchResultArr;

			if (val == resData.prevVal) return;

			this.clearResults();

			if (val.length < 2) {
				resData.prevRes = {};
				return;
			}

			var searchData = $.isEmptyObject(resData.prevRes) || e.which == 8 ? localStorage : resData.prevRes;

			resData.newRes = {};

			for (var i in searchData) {
				var str     = localStorage[i].toLowerCase(),
					reStr   = val.replace(' ', '\\s'),
					re      = new RegExp(reStr);

				if (re.exec(str)) resData.newRes[i] = str;
			}

			resData.prevRes = {};

			if (!$.isEmptyObject(resData.newRes)) {
				for (var i in resData.newRes) {
					resData.prevRes[i] = resData.newRes[i];
				}
			}

			this.makeResultsHtml();
		},

		selectEvent: function($obj) {
			var date    = $obj.attr('data-date'),
				dateArr = date.split('-'),
				date    = new Date(dateArr[2], dateArr[1], 0);

			Calendar.calendar.changeMonthData(date);
			Calendar.events.openEvent($obj);
			Calendar.search.hideResults();
		}

	},


	setMethods: function () {

		var o = this.options;

		/* calendar */
		o.prevMonth.on('click', function () {
			Calendar.calendar.changeMonth(-1);
		});

		o.nextMonth.on('click', function () {
			Calendar.calendar.changeMonth(1);
		});

		if (o.goCurrMonth)
			o.goCurrMonth.on('click', function () {
				Calendar.calendar.goCurrMonth();
				Calendar.calendar.setSelectedMonth();
			});

		o.wrapper.on('click', o.item, function () {
			var self = this;

			Calendar.calendar.selectDay($(this));
			setTimeout(function () {
				Calendar.events.openEvent($(self));
			}, 20);
		});


		/* overlay + event */
		o.createEvent.on('click', function () {
			var self = this;

			setTimeout(function () {
				Calendar.events.openEvent($(self));
			}, 20);
		});

		o.overlay.on('click.wrapper', o.eventWrap, function (e) {
			e.stopPropagation();
		});

		o.overlay.on('click.close', o.eventClose, function () {
			Calendar.events.closeEvent();
		});

		o.overlay.on('click.save', o.eventSave, function () {
			$(o.eventForm).trigger('submit');
		});

		o.overlay.on('click.delete', o.eventDelete, function () {
			Calendar.events.deleteEvent();
			Calendar.events.closeEvent();
		});

		o.overlay.on('submit', o.eventForm, function (e) {
			e.preventDefault();
			Calendar.events.saveEvent();
		});


		/* search */
		o.searchField.on({
			keyup: function (e) {
				Calendar.search.pullEvents(this.value, e);
			},
			focus: function () {
				Calendar.search.showResults();
			}
		});

		o.searchResult.on('click', function (e) {
			e.stopPropagation();
		});

		o.searchResult.on('click.item', o.searchItem, function () {
			var self = this;

			setTimeout(function () {
				Calendar.search.selectEvent($(self));
			}, 20);
		});



		$(document).on('click', function () {
			Calendar.events.closeEvent();
			Calendar.search.hideResults();
		});

	},


	getLocalData: function () {
		for (var i in localStorage) {
			this.localData[i] = JSON.parse(localStorage[i]);
		}
	},

	init: function (options) {
		this.options = options;

		this.getLocalData();
		this.getData.getThisMonthData(new Date());
		this.calendar.setSelectedMonth();
		this.tpl.makeHtml('wrapper', 'dayTpl', Calendar.data);
		this.setMethods();
	}

};