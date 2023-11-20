Vue.component('item', {
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
  store.commit('title', 'Товари та послуги')
  this.instance = 'item'
  this.instance_url = appDataset[this.instance]['url']
  this.read_front()
//  data2 = this.data.map(item => {
//            service_value = item.service ? "Так" : "";
//            return {
//                id: item.id,
//                item_description: item.item_description,
//                item_name: item.item_name,
//                service: service_value,
//                unit: item.unit
//            };
//        });
//  this.data = data2;
},
methods: {
  editRow: function (row) {
    app.navigate('/item/' + row.id)
  },
  addRow: function () {
    app.navigate('/item/0')
  }
}
})


// ------- Редагування товару ---------------
Vue.component('item-edit', {
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
  store.commit('title', 'Редагування товару (послуги)')
  this.instance = 'item'
  this.instance_url = appDataset[this.instance]['url']
  this.fetchUnits()
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
            app.navigate('/item/')
          }, (errors)=> {
            this.show_error(errors)
          })
        }
        else {
          this.update_back(this.data, ()=>{
            app.notify({type: 'success', message: 'Saved successfully'})
            app.navigate('/item/')
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
      app.navigate('/item/')
    }
  },
  show_error: function(errors) {
    let message = errors.join('<br>')
    app.alert(message, '<i class="fas fa-times-circle text-danger"></i> Error')
  },
    //  -------  Одиниці виміру ----------
  fetchUnits() {
    fetch('http://localhost:5000/unit/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Помилка завантаження списку одиниць виміру');
        }
        return response.json();
      })
      .then(data => {
        // Отримали список одиниць виміру , замінюємо ключі відповідно до форми компонента item
        data2 = data.map(item => {
            return {
                value: item.unit_code,
                caption: item.unit_name
            };
        });
        appDataset[this.instance]['fields']['form'][2]['items'] = data2;
      })
      .catch(error => {
        console.error('Помилка завантаження списку одиниць виміру', error);
      });
  }

},
watch: {
  ID() {
    this.init()
  }
}
})

app.componentsLoaded('item-edit')
app.componentsLoaded('item')