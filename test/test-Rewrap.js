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
            expect(rewrp._rewrapSource).to.equal('(?:@digits@hanzi+)+');
            expect(rewrp._regexpSource).to.equal('(?:[0-9]+(0?[1-9]|1[0-2])+)+');
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

        it('should /abc/',  () => {
            let rewrp = rewrap.and(/abc/);
            expect(rewrp._regexpSource).to.equal('abc');
        });

        it('should construct the long chain in readme.md 1',  () => {
            let rewrp = re(/^/)  // /^/

                    .ref('digits')  // /^[0-9]+/

                    .and(/abc/)  // /^[0-9]+abc/

                    .or(/bc/, /cd/) // /^[0-9]+abc|bc|cd/

                    // because the line below is leaded by re,
                    // so @digits will not refer to registry,
                    // and will generate regexp as is.
                    .and(/@digits/) // /(?:^[0-9]+abc|bc|cd)@digits/

                .wrap // now switch to rewrap style

                    // @digits will refer to registry, will be replaced by [0-9]+
                    // necessary () is added automatically for or expression
                    .and(/@digits/) // /(?:^[0-9]+abc|bc|cd)@digits[0-9]+/

                    // &a indicate that a will become (a)
                    // and will be saved as result.$$rewrapData.a while matching
                    .and(/a&a/) // /(?:^[0-9]+abc|bc|cd)@digits[0-9]+(a)/

                    .and(

                        // generate (xy)
                        // will be saved as result.$$rewrapData.xy while matching
                        // same as wrap(/(xy)&xy/)
                        wrap('x').and('y').save('xy')  // /(xy)/

                    ) // /(:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy)/
            expect(rewrp._rewrapSource).to.equal('(?:^@digitsabc|bc|cd)\\@digits@digitsa&a(xy)', 1);
            expect(rewrp._regexpSource).to.equal('(?:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy)', 2);
            let result = rewrp.match('23abc@digits34axy');
            expect(result[0]).to.equal('23abc@digits34axy',3);
        });

        it('should construct the long chain in readme.md 2',  () => {
            let rewrp = re(/^/)  // /^/

                .ref('digits')  // /^[0-9]+/

                .and(/abc/)  // /^[0-9]+abc/

                .or(/bc/, /cd/) // /(?:^[0-9]+abc|bc|cd)/

                // because the line below is leaded by re,
                // so @digits will not refer to registry,
                // and will generate regexp as is.
                .and(/@digits/) // /(?:^[0-9]+abc|bc)|cd@digits/

                .wrap // now switch to rewrap style

                // @digits will refer to registry, will be replaced by [0-9]+
                // necessary () is added automatically for or expression
                .and(/@digits/) // /(?:^[0-9]+abc|bc|cd)@digits[0-9]+/

                // &a indicate that a will become (a)
                // and will be saved as result.$$rewrapData.a while matching
                .and(/a&a/) // /(?:^[0-9]+abc|bc)|cd@digits[0-9]+(a)/

                .and(

                // generate (xy)
                // will be saved as result.$$rewrapData.xy while matching
                // same as wrap(/(xy)&xy/)
                wrap('x').and('y').save('xy')  // /(xy)/

                ) // /(:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy)/
                .save('part1')
                .register('sample')
                .rewrap(/@sample/);

            expect(rewrp._rewrapSource).to.equal('((?:^@digitsabc|bc|cd)\\@digits@digitsa&a(xy))@sample', 1);
            expect(rewrp._regexpSource).to.equal('((?:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy))((?:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy))', 2);
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
            expect(join('aa'.match(rewrp))).to.equal('aa a', /(a)*/);
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

        it('should String.match', () => {
            let rewrp, result, data = {};
            rewrp = rewrap(/(a)&a*/);
            expect(join('aa'.match(rewrp))).to.equal('aa a', /(a)*/);

            rewrp = rewrap(/(a)&a*/);
            result = 'aa'.match(rewrp);
            expect(result.$$rewrapData.a).to.equal('a', /(a)&a*/);


            // need rewrap-patch
            rewrp = rewrap(/(a)&a*&aa/);
            'aa'.match(rewrp, data={});
            expect(data.a).to.equal(undefined, /(a)&a*/);
            require('rewrap-patch');
            'aa'.match(rewrp, data={});
            expect(data.a).to.equal('a', /(a)&a*/);
        });

        it('should replace', () => {
            let rewrp, result, data = {};
            rewrp = rewrap(/(a)&a/g);
            expect(rewrp.replace('aa', (matches, data, offset) => data.a+1)).to.equal('a1a1', /(a)*/);
        });


        it('should replace /(a)&a*/g', () => {
            let rewrp, result, data = {};
            rewrp = rewrap(/(a)&a*/g);
            expect(rewrp.replace('aa', (matches, data, offset) => {
                return (data.a || '') + 1;
            })).to.equal('a11', /(a)*/);
        });

        it('should String.replace', () => {
            let rewrp, result, data = {};
            rewrp = rewrap(/(a)&a/);
            expect('aa'.replace(rewrp, (matches, data, offset) => {
                return (data.a || '') + 1;
            })).to.equal('a1a', /(a)*/);
        });


    });

});
