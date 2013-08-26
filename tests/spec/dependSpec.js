'use strict';

var path = require('path');

describe('Depend', function () {
    var depend = require('../../src/depend');

    depend.add('service1', function () {
        return {
            run: function (arg) {
                return arg;
            }
        };
    });

    depend.add('service2', function (service1) {
        return {
            run: function (arg) {
                return service1.run(arg);
            }
        };
    });

    depend.add('service3', function (service2) {
        return {
            run: function (arg) {
                return service2.run(arg);
            }
        };
    });

    depend.add('service4', function (service1, service2, service3) {
        return {
            run: function (arg) {
                return service1.run(arg) && service2.run(arg) && service3.run(arg);
            }
        };
    });

    depend.add('badService', function (service1, service2, service3, unexistingService) {
        return null;
    });

    depend.add('badService2', function (service1, badService) {
        return null;
    });

    it('should allow to create/retreive services', function () {
        expect(depend.get('service1')).toBeDefined();
        expect(depend.get('service1').run(true)).toBe(true);
        expect(function () {
            depend.get('_service1_');
        }).toThrow();
    });

    it('should inject services in service', function () {
        var service3 = depend.get('service3');
        var service4 = depend.get('service4');
        expect(service3.run(true)).toBe(true);
        expect(service4.run(true)).toBe(true);
    });

    it('should throw when trying to inject unexisting service', function () {
        expect(function () {
            depend.get('badService');
        }).toThrow();
        expect(function () {
            depend.get('badService2');
        }).toThrow();
    });

    it('should load services in folder', function () {
        depend.load(path.join(__dirname, '../fixtures/services/'));

        expect(depend.get('folderService1')).toBeDefined();
        expect(depend.get('folderService2')).toBeDefined();
    });

});
