var Calendar = require('calendar');
var Popover = require('popover');

var DatePicker = function(options){
  _.bindAll(this, 'hide', 'show', '_onKeyUp', '_onClick');

  var el = this.el = $(options.el);

  // Whenever the element is clicked we shwo the picker
  el.on('click', this._onClick);

  // A calendar view will be rendered inside of a popover
  this.calendar = new Calendar();

  // The returned date format
  this.calendar.format = options.format || el.attr('data-format') || 'DD/MM/YYYY';

  // The calendar is placed in a popover that is attached
  // to the element we've passed in
  this.popover = new Popover({
    el: this.calendar.el,
    target: el,
    position: options.position
  });

  // When a date is selected in the calendar we'll
  // format the date and emit our own event.
  this.calendar.on('select', this._onDateSelect, this);

  // Automatically assign the date to an input if there
  // is a data attribute we can use or if the attached field
  // is a text input we can just use this el.
  if( el.is('input[type="text"]') ) {
    this._input = el;
  }
  else if( el.attr('data-target') ) {
    this._input = $(el.attr('data-target'));
  }

  if( this._input ) {
    this._input.on('keyup', this._onKeyUp);
  }
};

_.extend(DatePicker.prototype, Backbone.Events, {

  // Hidden by default
  isVisible: false,

  // Hide the date picker
  hide: function(){
    this.popover.hide();
    this.isVisible = false;
    $(document).off('click', this.hide);
    this.calendar.el.off('.picker');
  },

  // Show the date picker
  show: function(){
    $(document).on('click', this.hide);

    // When clicking on the calendar itself, we don't want
    // to close it, we so stop the event from bubbling up. This
    // lets the calendar close when clicking outside of the element
    this.calendar.el.on('click.picker', function(event){
      event.stopPropagation();
    });

    // Show the calendar, obviously.
    this.popover.show();
    this.isVisible = true;
  },

  // When a date is selected in the calendar
  _onDateSelect: function(str, date) {
    this.hide();

    // Set the date in a text field if one has been assigned
    if( this._input ) {
      this._input.val(str).trigger('change');
    }

    // Trigger an event so anything watching
    // this view can do something with the date selection
    this.trigger('select', str, date);
  },

  // When the element is clicked, this could be a text input
  // or any other element that has been assigned as the anchor
  // for the date picker
  _onClick: function(event) {
    event.stopPropagation();
    this.show();
  },

  // On keyup in the input we'll close the picker. Note: if there
  // is no input specified this event won't ever fire.
  _onKeyUp: function() {
    this.hide();
  }

});

module.exports = DatePicker;