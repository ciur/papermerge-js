
import _ from "underscore";
import { Model, Collection } from 'backbone';

export class KVStore extends Model {
    defaults() {
      return {
        key: '',
        value: '',
        virtual_value: '',
        kv_inherited: false,
        kv_type: 'text',
        kv_format: undefined,
      };
    }

    initialize(doc_id) {
        this.on('change:kv_type', this.update_current_formats);
        this.trigger('change:kv_type');
    }

    update_current_formats() {
        if (this.get('kv_type') == 'date') {
            this.set(
                'current_formats',
                this.get('date_formats')
            );
        } else if (this.get('kv_type') == 'money') {
            this.set(
                'current_formats',
                this.get('currency_formats')
            );
        } else if (this.get('kv_type') == 'numeric') {
            this.set(
                'current_formats',
                this.get('numeric_formats')
            );
        } else {
            this.set(
                'current_formats',
                []
            );
        }
    }

    toJSON() {
        let dict = {}

        dict = {
            id: this.get('id'),
            key: this.get('key'),
            virtual_value: this.get('virtual_value'),
            kv_inherited: this.get('kv_inherited'),
            kv_type: this.get('kv_type'),
            kv_format: this.get('kv_format'),
        }

        // set 'value' only of there is actually a value
        if (this.get('value')) {
            dict['value'] = this.get('value');
        }

        return dict;
    }

    get disabled() {
        // used to disable input form for inherited
        // kv items
        if (this.get('kv_inherited')) {
            return 'disabled';
        }
        return ''
    }
}
