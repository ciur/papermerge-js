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
            if (options.node) {
                this.node = options.node;    
            } else if (options.nodes) {
                this.nodes = options.nodes;
            }
        }
    }

    urlRoot() {
        if (this.node) {
            return `/node/${this.node.id}/tags/`;
        } else if (this.nodes) {
            return `/nodes/tags/`;
        }
    }

    comma_sep_tags() {
        let result = "";
        for(let i = 0; i < this.models.length; i++) {
            result += `${this.models[i].get('name')}, `;
        }
        return result;
    }

    remove(model) {
        for (var i = 0; i < this.models.length; i++) {
            if (this.models[i].get('name') == model.get('name')) {
                this.models.splice(i, 1);
                this.length--;
                break;
            }
        }
    }

    save(options) {
        let token, request, tags, post_data, nodes = [];

        token = $("[name=csrfmiddlewaretoken]").val();

        tags = this.models.map(
            function(models) { 
                return models.attributes;
            }
        );

        if (this.node) {
            nodes = [node.id];
        } else if (this.nodes) {
            nodes = _.map(
                this.nodes,
                function(item){ return item.id; }
            );
        }

        post_data = {
            'tags': tags,
            'nodes': nodes
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

export class AllTags extends Collection {
    get model() {
        return Tag;
    }

    parse(response) {
      return response.tags;
    }
}
