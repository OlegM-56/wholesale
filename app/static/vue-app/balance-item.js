Vue.component('balance-item', {
  mixins: [crud, crud_front],
  template: `
<div>
  <div v-if="data">
    <!--  <button @click="addRow()" class="btn btn-outline-primary float-right mb-1"><i class="fas fa-plus-square"></i> Create</button> -->
    <standard-table
      perpage="10"
      :rows="data"
      :fields="appDataset[this.instance]['fields']['table']"
      perpage="10"
      @edit="editRow($event)"
      @delete="delete_front($event); form_data = null"
    />
  </div>
</div>`
,
mounted: function() {
  store.commit('title', 'Залишки по партіях')
  this.instance = 'balance-item'
  this.instance_url = appDataset[this.instance]['url']
  this.read_front()
},
methods: {
  editRow: function (row) {
    app.navigate('/balance-item/' + row.party_id)
  },
  addRow: function () {
    app.navigate('/balance-item/0')
  }
}
})


// ------- Редагування залишків по партіях ---------------
Vue.component('balance-item-edit', {
  mixins: [crud],
  computed: {
    PARTY_ID: function () {
      return app.getRouteParam('party_id')
  }
  },
  template: `
<div>
  <div v-if="data">

    <standard-form
      :data="data"
      :fields="appDataset[this.instance]['fields']['form']"
      :actions="[
          {name:'submit', title: 'Save', action: 'Save', class: '', dafault: true},
          {name:'cancel', title: 'Cancel', action: 'Cancel', class: ''}
      ]"
      @action="doAction($event)"
    />

  </div>
</div>`
,
mounted: function() {
  store.commit('title', 'Редагування залишків по партіях')
  this.instance = 'balance-item'
  this.instance_url = appDataset[this.instance]['url']
  this.pk = 'party_id'

//  this.fetchUnits()
  this.init()
},
methods: {
  init: function () {
    let row = {party_id: this.PARTY_ID}
    this.read_back(row, (response)=> {
        this.data = response
      },
      (errors) => {
        this.show_error(errors)
      }
    );
  },
  doAction: function ($event) {
    if ($event.action.name == 'submit') {
      if ($event.valid == true) {
        if (this.PARTY_ID == 0) {
          this.create_back(this.data, ()=>{
            app.notify({type: 'success', message: 'Created successfully'})
            app.navigate('/balance-item/')
          }, (errors)=> {
            this.show_error(errors)
          })
        }
        else {
          this.update_back(this.data, ()=>{
            app.notify({type: 'success', message: 'Saved successfully'})
            app.navigate('/balance-item/')
          }, (errors)=> {
            this.show_error(errors)
          })
        }
      }
      else {
        app.alert('Form is NOT valid!', '<i class="fas fa-times-circle text-danger"></i> Error')
      }
    }
    if ($event.action.name == 'cancel') {
      app.navigate('/balance-item/')
    }
  },
  show_error: function(errors) {
    let message = errors.join('<br>')
    app.alert(message, '<i class="fas fa-times-circle text-danger"></i> Error')
  },

},
watch: {
  PARTY_ID() {
    this.init()
  }
}
})

app.componentsLoaded('balance-item-edit')
app.componentsLoaded('balance-item')