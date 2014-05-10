/* jshint node: true */

console.log('\n#####################################\n# Basic Application Frame Tests 1.0 #\n#####################################\n');

require('../af.js');

var exit= $$.process.exit;

$_('engine').override({
    coreLock : true,
    masterApplication : 'test-master',
    support : false
});


$('application').new('test');
$('application').new('test-master');

$_('test').main(function(){
    console.log('helper Application spawned!');
    this.property= 'value - 000';
});

$_('application').main(function(scope){
    
    if(!scope){
        console.error('faild to access scope!');
        exit(1);
        }
    
    console.info('main Application spwaned!');
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
    
    console.log('try to load core Extensions... ' + ( this.tests.ext= require('../modules/core-extensions.js'), ((this.tests.ext) ? 'okay' : 'faild') ));
    this.tests.prototype= $$.prototyping;
    console.log('testing advanced prototyping... ' + ((this.tests.prototype) ? 'okay' : 'faild'));
    this.tests.event= $$.EventManager;
    console.log('testing eventManager... ' + ((this.tests.event) ? 'okay' : 'faild'));
    for(var i in this.tests){
        if(!i){
            exit(1);
            }
        }
    console.log('testing module builder...');
    this.tests= [];
    $('new')({
        name : 'builder-test',
        constructor : function(engine){
            console.log('construct test module...');
            console.log('enumerating engine object...');
            for(var i in engine){
                console.log('engine.' + i + ' is available...');
            }
            this.x= '123';
            this.y= 'y-property';
            this.z= 50;
            this.m= function(){
                return this.x;
            };
        }
    });
    this.tests.push($('builder-test'));
    console.log('testing test module... ' + ((this.tests[0]) ? 'okay' : 'faild'));
    this.tests.push($('builder-test').x == '123' && $('builder-test').y == 'y-property');
    console.log('testing properties... ' + ((this.tests[1]) ? 'okay' : 'faild'));
//    console.log('testing launch queue...');
//    this.tests.push($('queue').push({type : 'test', }));
    exit(0); 
});