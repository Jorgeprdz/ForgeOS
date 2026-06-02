// cartera-state.js

export const CarteraStore = {

    state: {

        polizas: [],

        editingId: null,

        loading: false
    },

    setPolizas(polizas) {

        this.state.polizas =
            Object.freeze([...polizas]);
    },

    setLoading(value) {

        this.state.loading =
            Boolean(value);
    },

    setEditingId(id) {

        this.state.editingId =
            id;
    },

    resetEditing() {

        this.state.editingId =
            null;
    }
};