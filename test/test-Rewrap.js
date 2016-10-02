const {expect, iit, idescribe, nit, ndescribe, ddescribe} = require('bdd-test-helper');

const {join} = require('./util');
const rewrap = require('../lib');
const {Rewrap, re, wrap, or, and} = rewrap;

describe('test-Rewrap', () => {

    describe('construct rewrap', () => {

        it('should construct Rewrap', () => {
            let rewrp = rewrap('abc|ab');
            expect(rewrp instanceof Rewrap).to.be.true;
        });

        it('should construct or', () => {
            let rewrp = rewrap.or('abc', 'ab');
            expect(rewrp instanceof Rewrap).to.be.true;
        });

        it('should construct with rewrap style',  () => {
            let rewrp = wrap.and(/@name/);
            expect(rewrp instanceof Rewrap).to.be.true;
        });

    });


    describe('match', () => {
        it('should match', () => {
            let rewrp = rewrap('abc|ab');
            expect(join(rewrp.match('abc'))).to.equal('abc');
        });
    });

});
