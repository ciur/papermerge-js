import _ from "underscore";
import { Model, Collection } from 'backbone';
import { MessageView } from '../views/message';


export class Tag extends Model {
    /**
        Used to tag folder/document.
    */
    urlRoot() {
        return '/tag-node/';
    }

    modelId() {
        return this.get('name')
    }

    toJSON() {
        let dict = {
            name: this.get('name'),
        }

        return dict;
    }
}

export class Tags extends Collection {
    get model() {
        return Tag;
    }

    initialize(model, options) {
        if (options) {
            this.node = options.node;
        }
    }

    urlRoot() {
        if (this.node) {
            return `/node/${this.node.id}/tags/`;
        }
    }

    remove(model) {
        for (var i = 0; i < this.models.length; i++) {
            if (this.models[i].get('title') == model.get('title')) {
                this.models.splice(i, 1);
                this.length--;
                break;
            }
        }
    }

    save(options) {
        let token, request, tags ,post_data;

        token = $("[name=csrfmiddlewaretoken]").val();

        tags = this.models.map(
            function(models) { 
                return models.attributes;
            }
        );

        post_data = {
            'tags': tags,
        }
        
        $.ajaxSetup({
            headers: { 'X-CSRFToken': token}
        });

        request = $.ajax({
            method: "POST",
            url: this.urlRoot(),
            data: JSON.stringify(post_data),
            contentType: "application/json",
            dataType: 'json',
            error: function(xhr, text, error) {
                new MessageView(
                    "Error",
                    xhr.responseJSON['msg'], 
                );
            }
        });

        request.done(options['success']);  
    }
}
