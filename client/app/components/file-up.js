import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement() {
    document.getElementById('files').addEventListener('change', (evt) => {
      var file = evt.target.files[0]; // FileList object
      var reader = new FileReader();
      if (!this.get('data.files')) {
        Ember.set(this.get('data'), 'files', Ember.A())
      }
      reader.readAsDataURL(file);
      reader.onload = (theFile) => {
        var fileString = theFile.target.result;
        console.log('ok', fileString);
        this.get('data.files').pushObject(fileString);
      };
    }, false);
  }
});
