function Assignment(attributes) {
  var self = this;

  if (attributes !== null && _.isPlainObject(attributes)) {
    _.extend(self, {
      id: ko.observable(attributes.assignment_id),
      user_id: ko.observable(attributes.user_id),
      client_name: ko.observable(attributes.client_name),
      project_active: ko.observable(attributes.project_active || true),
      assignment_archived: ko.observable(attributes.assignment_archived || false),
      assignment_proposed: ko.observable(attributes.assignment_proposed || false),
      project_name: ko.observable(attributes.project_name),

      actual_total: (attributes.actual_total || 0),
      diff: attributes.diff,
      estimated_total: (attributes.estimated_total || 0),
      work_weeks: (attributes.work_weeks || []),
      project_id: attributes.project_id
    });
  }

  this.user_id.subscribe(_.bind(function(newvalue) {
    this.updateAssignment();
  }, this))
}

_.extend(Assignment.prototype, {
  updateAssignment: function() {
    $.ajax({
      type: "PUT",
      url: '/assignments/' + this.id() + '.json',
      dataType: 'json',
      data: {assignment:
        _.pick(ko.toJS(this),
          ["id", "user_id", "client_name", "project_active",
           "assignment_archived", "assignment_proposed", "project_name",
           "actual_total", "diff", "estimated_total", "project_id"]
         )
        },
      success: _.bind(function(response, data, status, jqxhr) {
        // this.attributes.id(response.id);
        // this.attributes.project_id = response.project_id;
      }, this),
      error: _.bind(function(response, data, status, jqhr) {
        $('.flash-container').append(
          "<p class='flash-error flash'>\
            Unexpected error occurred. Please try again.\
            <a class='close' href='javascript:void(0)'>close</a>\
          </p>"
        )
      }, this)
    })
  },
  create: function() {
    $.ajax({
      type: "POST",
      url: '/assignments.json',
      dataType: 'json',
      data: {assignment: ko.toJS(this.attributes)},
      success: _.bind(function(response, data, status, jqxhr) {
        this.attributes.id(response.id);
        this.attributes.project_id = response.project_id;
      }, this),
      error: _.bind(function(response, data, status, jqhr) {
        $('.flash-container').append(
          "<p class='flash-error flash'>\
            Unexpected error occurred. Please try again.\
            <a class='close' href='javascript:void(0)'>close</a>\
          </p>"
        )
      }, this)
    });
  },
  destroy: function() {
    $.ajax({
      type: "DELETE",
      url: '/assignments/' + this.id() + '.json',
      dataType: 'json',
      // data: {assignment: ko.toJS(this.attributes)},
      success: _.bind(function(response, data, status, jqxhr) {
        // this.attributes.id(response.id);
        // this.attributes.project_id = response.project_id;
      }, this),
      error: _.bind(function(response, data, status, jqhr) {
        $('.flash-container').append(
          "<p class='flash-error flash'>\
            Unexpected error occurred. Please try again.\
            <a class='close' href='javascript:void(0)'>close</a>\
          </p>"
        )
      }, this)
    });
  }
})
