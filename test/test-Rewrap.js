const {expect, iit, idescribe, nit, ndescribe, ddescribe} = require('bdd-test-helper');

const {join} = require('./util');
const reBuiltins = require('regexp-frequent');
const rewrap = require('../lib');
const {Rewrap, re, wrap, or, and} = rewrap;
rewrap.registry(reBuiltins);

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


        it('should construct 1&a', () => {
            let rewrp = rewrap('1&a');
            expect(rewrp._rewrapSource).to.equal('1&a');
            expect(rewrp._regexpSource).to.equal('(1)');
        });

        it('should construct [)]', () => {
            let rewrp = rewrap('[)]');
            expect(rewrp._rewrapSource).to.equal('[)]');
            expect(rewrp._regexpSource).to.equal('[)]');
        });

        it('should construct /[\)]/', () => {
            let rewrp = rewrap(/[\)]/);
            expect(rewrp._rewrapSource).to.equal('[\\)]', 'rewrap');
            expect(rewrp._regexpSource).to.equal('[\\)]');
        });

        it('should throw with no definition',  () => {
            expect(() => wrap.and(/@name/)).to.throw();
        });

        it('should construct with [/@digits/] notation',  () => {
            let rewrp = wrap.and([/@digits/]);
            expect(rewrp instanceof Rewrap).to.be.true;
            expect(rewrp._rewrapSource).to.equal('@digits');
            expect(rewrp._regexpSource).to.equal('[0-9]+');
        });

        it('should construct with wrap.and([/@digits@hanzi+/]) notation',  () => {
            let rewrp = wrap.and([/@digits@hanzi+/]);
            expect(rewrp instanceof Rewrap).to.be.true;
            expect(rewrp._rewrapSource).to.equal('@digits@hanzi+');
            expect(rewrp._regexpSource).to.equal('[0-9]+(0?[1-9]|1[0-2])+');
        });

        it('should construct with wrap.and([/@digits@hanzi+/]).some() notation',  () => {
            let rewrp = wrap.and([/@digits@hanzi+/]).some();
            expect(rewrp instanceof Rewrap).to.be.true;
            expect(rewrp._rewrapSource).to.equal('(:@digits@hanzi+)+');
            expect(rewrp._regexpSource).to.equal('(:[0-9]+(0?[1-9]|1[0-2])+)+');
        });

        it('should construct with wrap.and([/@digits@hanzi+/]).not() notation',  () => {
            let rewrp = wrap.and([/@digits@hanzi+/]).not();
            expect(rewrp instanceof Rewrap).to.be.true;
            expect(rewrp._rewrapSource).to.equal('(?!@digits@hanzi+)');
            expect(rewrp._regexpSource).to.equal('(?![0-9]+(0?[1-9]|1[0-2])+)');
        });

        it('should construct with array notation',  () => {
            let rewrp = rewrap(['@digits', '@hanzi+']).not();
            expect(rewrp instanceof Rewrap).to.be.true;
            expect(rewrp._rewrapSource).to.equal('(?!@digits@hanzi+)');
            expect(rewrp._regexpSource).to.equal('(?![0-9]+(0?[1-9]|1[0-2])+)');
        });

        it('should skip % after ref name',  () => {
            let rewrp = rewrap(['@digits%', '@hanzi%+']).not();
            expect(rewrp instanceof Rewrap).to.be.true;
            expect(rewrp._rewrapSource).to.equal('(?!@digits%@hanzi%+)');
            expect(rewrp._regexpSource).to.equal('(?![0-9]+(0?[1-9]|1[0-2])+)');
        });

    });


    describe('match', () => {
        it('should match normal regexp', () => {
            let rewrp, result;
            rewrp = rewrap('');
            expect(join(rewrp.match(''))).to.equal('', '');
            rewrp = rewrap(/|/);
            expect(join(rewrp.match(''))).to.equal('', /|/);
            rewrp = rewrap(/(|)/);
            expect(join(rewrp.match(''))).to.equal(' ', /|/);
            rewrp = rewrap(/a*/);
            expect(join(rewrp.match('aa'))).to.equal('aa', /a*/);
            rewrp = rewrap(/(a)*/);
            expect(join(rewrp.match('aa'))).to.equal('aa a', /(a)*/);
            rewrp = rewrap(/[\)]/);
            expect(join(rewrp.match(')'))).to.equal(')', /[\)]/);
            rewrp = rewrap(/[)]/);
            expect(join(rewrp.match(')'))).to.equal(')', /[)]/);

            rewrp = rewrap('abc|ab');
            expect(join(rewrp.match('abc'))).to.equal('abc', 'abc|ab   abc');
            rewrp = rewrap('abc|ab');
            expect(join(rewrp.match('ab'))).to.equal('ab','abc|ab   ab' );
            rewrp = rewrap('(abc|ab)');
            expect(join(rewrp.match('ab'))).to.equal('ab ab', '(abc|ab)   ab');
            rewrp = rewrap('(abc|ab|)');
            expect(join(rewrp.match('ab'))).to.equal('ab ab', '(abc|ab|)   ab');
            rewrp = rewrap('(a(b)c|ab|)');
            expect(join(rewrp.match('ab'))).to.equal('ab ab ', '(abc|ab|)   ab');
            rewrp = rewrap('(a(b)c|ab|)');
            expect(join(rewrp.match('abc'))).to.equal('abc abc b', '(abc|ab|)   abc');
        });

        it('should match with data name', () => {
            let rewrp, result, data = {};
            rewrp = rewrap(/(a)&a*/);
            expect(join(rewrp.match('aa'))).to.equal('aa a', /(a)*/);
            rewrp = rewrap(/(a)&a*/);
            result = rewrp.match('aa');
            expect(result.$$rewrapData.a).to.equal('a', /(a)&a*/);
            rewrp = rewrap(/(a)&a*&aa/);
            rewrp.match('aa', data={});
            expect(data.a).to.equal('a', /(a)&a*/);
            expect(data.aa).to.equal('aa', /(a)&a*/);
            rewrp = rewrap(/(a)&a*&/);
            result = rewrp.match('aa', data={});
            expect(result).to.equal(null, 1);
            result = rewrp.match('aa&', data={});
            expect(join(result)).to.equal('aa& a', 1);
            rewrp = rewrap(/&a/);
            result = rewrp.match('&a', data={});
            expect(JSON.stringify(result)).to.deep.equal(`["&a"]`, 2);
            rewrp = rewrap(/1&a/);
            result = rewrp.match('1&a', data={});
            expect(JSON.stringify(result)).to.deep.equal('["1","1"]', 2);
        });


    });

});
