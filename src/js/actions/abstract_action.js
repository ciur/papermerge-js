/***********************************************************************
                                                                      
Copyright (C) 2019 Eugen Ciur
All Rights Reserved                                                   
                                                                      
This is unpublished proprietary source code of Eugen Ciur.            
                                                                      
You may not copy, modify, sublicense or distribute the Program except 
if expressly allowed by Eugen Ciur.                                   
                                                                      
The copyright notice above does not evidence any intended publication 
of such source code.                                                  
                                                                      
************************************************************************/
import $ from "jquery";

export class DgAbstractAction {
  /*
    Action triggered from menu/actiobar
  */
  constructor(config) {
    this._enabled_cond = config['enabled'];
    // id is a DOM selector (i.e a string)
    this._id = config['id'];
    this._is_enabled = config['initial_state'] || false;
    this._confirm = config['confirm'];
    this._action = config['action'];

    if(this._is_enabled) {
      this.enable();
    }
  }

  get id() {
    return this._id;
  }

  get confirm() {
    return this._confirm;
  }

  get is_enabled() {
    return this._is_enabled;
  }

  enable() {
    this._is_enabled = true;
    $(this._id).removeClass("disabled");
  }

  disable() {
    this._is_enabled = false;
    $(this._id).addClass("disabled");
  }

  toggle(selection, clipboard) {
    if (this._enabled_cond(selection, clipboard)) {
      this.enable();
    } else {
      this.disable();
    }
  }

  action(selection, current_node) {
    this._action(selection, current_node);
  }
}