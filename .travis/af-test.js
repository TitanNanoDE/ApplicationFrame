/* jshint node: true */

console.log('\n#####################################\n# Basic Application Frame Tests 1.0 #\n#####################################\n');

require('../af.js');

var exit= self.process.exit;

$_('engine').override({
    coreLock : true,
    masterApplication : 'test-master',
    support : false
});


$('application').new('test');
$('application').new('test-master');

$_('test')(function(){
    console.log('helper Application spawned!');
    this.property= 'value - 000';
});

$_('application')(function(scope){
    
    if(!scope){
        console.error('faild to access scope!');
        exit(1);
        }
    
    console.info('main Application is running!');
    this.tests= {
        root : false,
        propGet : false,
        propSet : false,
        prototype : false,
        ext : false,
        event : false
        };

//  testing public properties
    console.log('testing public properties...');
    
    this.tests.propGet= $_('test').get('property');
    console.log('application::test.property.get... '+ ((this.tests.propGet) ? 'okay' : 'faild'));
    
    this.tests.propSet= $_('test').set('property', 'newValue');
    console.log('application::test.property.set... ' + ((this.tests.propSet) ? 'okay' : 'faild'));
    
    this.tests.root= $_('engine').requestRoot(this);
    console.log('requesting access to the engine... ' + ((this.tests.root) ? 'okay' : 'faild'));
    console.log('engine: ' + this.engine.name);
    console.log('version: ' + this.engine.version);
    console.log('engineType: ' + this.engine.type);
    console.log('platform: ' + this.engine.platform);
    
    console.log('try to load core Extensions...');
    this.tests.ext= require('../modules/core-extensions.js');
    console.log((this.tests.ext) ? 'okay' : 'faild');
    this.tests.prototype= self.prototyping;
    console.log('testing advanced prototyping... ' + ((this.tests.prototype) ? 'okay' : 'faild'));
    this.tests.event= self.EventManager;
    console.log('testing eventManager... ' + ((this.tests.event) ? 'okay' : 'faild'));
    for(var i in this.tests){
        if(!i){
            exit(1);
            }
        }
    exit(0); 
});