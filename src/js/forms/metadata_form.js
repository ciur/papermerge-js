
export class MetadataForm {
    constructor(
        node,
        id="#metadata_form",
    ) {
        this._node = node; // only one item!
        this._id = id;
        
        this._create_hidden_input(node);
        // will create hidden input for parent id
        // to know to which folder to redirect back
        // if this parameter is missing - will redirect back
        // to root folder.
        this._create_hidden_parent(parent_id);
        this._set_title(node);
        this.build_simple_key_actions();
    }

    build_simple_key_actions() {
        $("#add_simple_meta").click(function(){
            $("ul#simple_keys").append(
                "<li><input id='' name='key' type='text' value=''></li>"
            );
        });

        $("#add_comp_meta").click(function(){
            $("ul#comp_keys").append(
                "<li><input id='' name='comp_key' type='text' value=''></li>"
            );
        });
    }

    configEvents() {
    }

    _set_title(item) {
        $(this._id).find("[name=title]").val(item.title);
    }

    _create_hidden_parent(parent_id="") {
        let hidden_parent =  `<input \
            type="hidden" \
            name="parent_id" \
            value="${parent_id}" \
            />`;

        $(this._id).append(
            hidden_parent
        );
    }

    _create_hidden_input(item) {
        let hidden_input = `<input \
         type="hidden" \
         name="node_id" \
         value="${item.id}" \
         />`

        $(this._id).append(hidden_input);
    }

    on_submit() {
        let token = $("[name=csrfmiddlewaretoken]").val();
        let simple_keys = [];
        $("input[name=key_name]").each(function(){
            simple_keys.push({
                'id': this.id,
                'key': this.value
            });
        });

        $.ajaxSetup({
            headers:
            { 'X-CSRFToken': token}
        });

        $.post(
            `/kvstore/${this._node.id}`,
            JSON.stringify(simple_keys),
        );
    }

    unbind_events() {
        // unbind action events
        this._actions.unbind_events();
        // unbind submit event
        $(this._id).off("submit");
    }

    show() {
        let that = this;

        $("#modals-container").css("display", "flex");
        $.ajax({
            url: `/kvstore/${this._node.id}`
        }).done(function(data){
            // load server side data
            let norm_ai;
            
            that.clear();

            for(let kvstore_hash of data) {
            }
            $(that._id).find(".cancel").click(function(e){ 
               e.preventDefault();
               $("#modals-container").hide();
               $(that._id).hide();
               // unbind submit event.
               $(that._id).off("submit");
            });

            // on submit send data to server side
            $(that._id).submit(function(e){
                e.preventDefault();
                $(that._id).css("display", "none");
                $("#modals-container").hide();
                that.on_submit();
            });

        });

        $(that._id).show();
    }
}



