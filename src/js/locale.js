let DGL_MO = {
    'de': {
        'allow': 'Zulassen',
        'deny': 'Verweigern',
        'Read': 'Lesen',
        'Read & Write': 'Lesen & Schreiben',
        'Read & Write & Delete': 'Lesen & Schreiben & Löschen',
        'Full Control': 'Vollständige Kontrolle',
        'User Defined': 'Benutzerdefiniert'
    },
}

export class DgLocale {
    constructor(hostname) {
        let matched = undefined;
        if (hostname) {
            matched = hostname.match(/.*\.de/g);
        }
        if (matched) {
            this._lang = DgLocale.DE;
        } else {
            this._lang = DgLocale.EN;
        }
    }

    static get DE() {
        return 'de';
    }

    static get EN() {
        return 'en';
    }

    get lang() {
        return this._lang;
    }

    gettext(text) {
        if (!text) {
            return;
        }
        if (this.lang == DgLocale.DE) {
            return DGL_MO[this.lang][text];
        }

        return text;
    }
}