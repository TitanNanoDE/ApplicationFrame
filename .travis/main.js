/* eslint-env mocha */

'use strict';

let exec = require('child_process').exec;
let assert = require('assert');

console.log('### Application Frame Tests ###');

let codeReady = new Promise((success, failed) => {
    exec('gulp', function(error, stdout, stderr) {
        if (error) {
            console.error('compiler:', stderr);
            failed(error);
        }

        success();
    });
});

describe('compile', function(){
    this.slow(10000);
    this.timeout(0);

    it('should compile the source code so we can test it', () => {
        return codeReady;
    })
})

describe('core', function(){
    let Af = null;
    let share = { Af : null };

    it('should import the main script', () => {
        Af = require('../dist/af.js').default;
        share.Af = Af;

        assert.notEqual(null, Af);
    })

    describe('public Util methods', () => {
        let makejs = null;

        it('should import the make util', () => {
            makejs = require('../dist/util/make.js');

            assert.notEqual(null, makejs);
        });

        it('should expose the Make function', () => {
            assert.equal(makejs.Make, Af.Util.Make);
        });

        it('should expose the hasPrototype function', () => {
            assert.equal(makejs.hasPrototype, Af.Util.hasPrototype);
        });

        it('should expose the Mixin function', () => {
            assert.equal(makejs.Mixin, Af.Util.Mixin);

        });
    });

    describe('public prototypes', () => {
        it('should expose the Application prototype', () => {
            let application = require('../dist/core/prototypes/Application.js').default;

            assert.equal(application, Af.Prototypes.Application);
        });

        it('should expose the EventTarget prototype', () => {
            let eventTarget = require('../dist/core/prototypes/EventTarget.js').default;

            assert.equal(eventTarget, Af.Prototypes.EventTarget);
        });
    });

    require('./Application.js');

    require('./EventTarget.js').test(assert, share);
});



/*var exit= $$.process.exit;

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
});*/
