function supports_html5_storage () {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

function createHelpers () {

	Handlebars.registerHelper('split', function (text) {
		text = text.replace(/,\s+/g, ',');
		text = text.split(',');

		return new Handlebars.SafeString(text);
	});

};

$(function () {

	supports_html5_storage();
	createHelpers();

	Calendar.init({
		prevMonth:      $('#b-calendar__prev-month'),
		nextMonth:      $('#b-calendar__next-month'),
		choosedDate:    $('#b-calendar__choosed-date'),
		goCurrMonth:    $('#b-calendar__this-date'),

		wrapper:        $('#b-calendar'),
		item:           '.b-calendar__item',
		itemClass:      'b-calendar__item',
		itemTitle:      '.b-calendar__item__title',
		itemMembers:    '.b-calendar__item__members',
		selectedItem:   'b-calendar__item_selected',

		overlay:        $('#b-overlay'),
		eventWrap:      '.b-calendar__event',
		eventClose:     '.b-calendar__event__close-btn',
		eventSave:      '.b-calendar__event__save',
		eventDelete:    '.b-calendar__event__delete',
		eventForm:      '.b-calendar__event__form',
		createEvent:    $('#b-calendar__create-event'),

		searchField:    $('#b-calendar__search__field'),
		searchResult:   $('#b-calendar__search-result'),
		searchItem:     '.b-calendar__search-result__item',

		dayTpl:         $('#template-calendar-cell'),
		eventTpl:       $('#template-calendar-event'),
		searchTpl:      $('#template-search-results')
	});

});