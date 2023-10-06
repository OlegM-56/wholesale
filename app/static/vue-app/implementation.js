Vue.component('implementation', {
  template: `
<div>
  <h2 class="center-text">Виконання завдання</h2>
  <h5>База даних</h5>
  <pre>
    Для створення таблиць Бази даних використовував моделі SQLAlchemy та розширення Migrate.
    Це дозволяє автоматично створювати таблиці в БД на основі моделей SQLAlchemy та здійснювати міграцію бази даних при зміні моделей даних.
    Маємо інструменти для створення та керування версіями бази даних, щоб зберегти та відстежувати зміни без втрати даних.
    Міграція важлива при розвитку додатків, оскільки вона дозволяє оновлювати базу даних без необхідності перезавантаження чи втрати існуючої інформації.
  </pre>
  <p>
  </p>
  <p>
  </p>
  <p>
  </p>
</div>`,
  mounted: function() {
    store.commit('title', 'Особливості реалізації задачи')
  }
})

app.componentsLoaded('implementation')
