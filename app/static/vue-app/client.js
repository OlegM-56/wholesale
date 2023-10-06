Vue.component('client', {
  mixins: [crud, crud_front],
  template: `
<div>

  <!-- <a href="#/client_old/">Previous version with dialog form</a> -->

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
  store.commit('title', 'Client')
  this.instance = 'client'
  this.instance_url = appDataset[this.instance]['url']
  this.read_front()
},
methods: {
  editRow: function (row) {
    app.navigate('/client/' + row.id)
  },
  addRow: function () {
    app.navigate('/client/0')
  }
}
})

Vue.component('client-edit', {
  mixins: [crud],
  computed: {
    ID: function () {
      return app.getRouteParam('id')
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
  store.commit('title', 'Client Edit')
  this.instance = 'client'
  this.instance_url = appDataset[this.instance]['url']
  this.init()
},
methods: {
  init: function () {
    let row = {id: this.ID}
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
        if (this.ID == 0) {
          this.create_back(this.data, ()=>{
            app.notify({type: 'success', message: 'Created successfully'})
            app.navigate('/client/')
          }, (errors)=> {
            this.show_error(errors)
          })
        }
        else {
          this.update_back(this.data, ()=>{
            app.notify({type: 'success', message: 'Saved successfully'})
            app.navigate('/client/')
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
      app.navigate('/client/')
    }
  },
  show_error: function(errors) {
    let message = errors.join('<br>')
    app.alert(message, '<i class="fas fa-times-circle text-danger"></i> Error')
  }
},
watch: {
  ID() {
    this.init()
  }
}
})

app.componentsLoaded('client-edit')
app.componentsLoaded('client')