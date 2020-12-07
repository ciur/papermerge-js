import $ from "jquery";
import _ from "underscore";
import { View } from 'backbone';

export class RoleMultiToggleView extends View {
    /**
        Applicable ONLY in Roles forms/views.
        Instead of clicking on each individual sub-checkbox of 
        (for example) Document group:
        
        [] Document:
            [] Can add Document
            [] Can change Document
            [] Can delete Dcoument
            [] Can view Document
        user will click only on Document top most checkbox.
        Saves 4X clicks :)
        Group checkboxes (in example above the one coresponding to 'Document')
        have a css class 'multi-toggle'.
        'multi-toggle' css class is added by custom widget template
            
            papermerge/contrib/admin/widgets/checkbox_select.html
    **/
    el() {
        return $('#id_permissions');
    }

    initialize() {
        this.$el.find('.multi-toggle').each(function(index, multi_toggle){
            let checked_arr, sum, $multi_toggle;

            $multi_toggle = $(multi_toggle);

            checked_arr = $multi_toggle.parent().parent().find('input[type=checkbox]');
            /**
                Counts number of checkboxes in the group. If there are 4 selected - 
                will automatically check parent as well.
            **/
            sum = _.reduce(
                checked_arr,
                function(memo, item) { 
                    if ($(item).prop('checked')) {
                        memo += 1;
                    };

                    return memo;
                },
                0
            );

            if (sum >= 4) {
                $multi_toggle.prop('checked', true);
            }
        });
    }

    events() {
        let event_map = {
            'click .multi-toggle': 'on_multi_toggle',
        }

        return event_map;
    }

    on_multi_toggle(event) {
        let $model = $(event.currentTarget);

        if ($model.prop('checked')) {
          // select other 4 checkboxes
          $model.parent().parent().find('input[type=checkbox]').prop('checked', true);
        } else {
          // unselect other 4 checkboxes
          $model.parent().parent().find('input[type=checkbox]').prop('checked', false);
        }
    }
};
