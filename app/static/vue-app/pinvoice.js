Vue.component('pinvoice', {
  mixins: [crud, crud_front],
  template: `
<div>
  <div v-if="data">
    <button @click="addRow()" class="btn btn-outline-primary float-right mb-1"><i class="fas fa-plus-square"></i> Create</button>
    <standard-table
      perpage="10"
      :rows="data"
      :fields="appDataset[this.instance]['fields']['table']"
      :actions="[
          {name:'edit', caption:'', title: ' Edit', action: 'edit', class: 'fas fa-edit text-primary fa-icon-900'},
          {name:'delete', caption:'', title: 'Delete', action: 'delete', class: 'fas fa-eraser text-danger fa-icon-900'}
      ]"
      perpage="10"
      @edit="editRow($event)"
      @delete="delete_front($event); form_data = null"
    />
  </div>
</div>`
,
mounted: function() {
  store.commit('title', 'Прибуткові накладні')
  this.instance = 'pinvoice'
  this.instance_url = appDataset[this.instance]['url']
  this.read_front()
},
methods: {
  editRow: function (row) {
    app.navigate('/pinvoice/' + row.num_doc)
  },
  addRow: function () {
    app.navigate('/pinvoice/0')
  }
}
})


// ------- Редагування залишків по партіях ---------------
Vue.component('pinvoice-edit', {
  mixins: [crud],
  computed: {
    NUM_DOC: function () {
      return app.getRouteParam('num_doc')
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
  store.commit('title', 'Редагування Прибуткової накладної')
  this.instance = 'pinvoice'
  this.instance_url = appDataset[this.instance]['url']
  this.pk = 'num_doc'

//  this.fetchUnits()
  this.init()
},
methods: {
  init: function () {
    let row = {num_doc: this.NUM_DOC}
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
        if (this.NUM_DOC == 0) {
          this.create_back(this.data, ()=>{
            app.notify({type: 'success', message: 'Created successfully'})
            app.navigate('/pinvoice/')
          }, (errors)=> {
            this.show_error(errors)
          })
        }
        else {
          this.update_back(this.data, ()=>{
            app.notify({type: 'success', message: 'Saved successfully'})
            app.navigate('/pinvoice/')
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
      app.navigate('/pinvoice/')
    }
  },
  show_error: function(errors) {
    let message = errors.join('<br>')
    app.alert(message, '<i class="fas fa-times-circle text-danger"></i> Error')
  },

},
watch: {
  NUM_DOC() {
    this.init()
  }
}
})

app.componentsLoaded('pinvoice-edit')
app.componentsLoaded('pinvoice')