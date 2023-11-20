Vue.component('seller', {
  mixins: [crud, crud_front],
  template: `
<div>

This component is not used.

</div>`,
  mounted: function() {
  }
})

app.componentsLoaded('seller')
