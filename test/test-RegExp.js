const {expect, iit, idescribe, nit, ndescribe, ddescribe} = require('bdd-test-helper');

const {join} = require('./util');

describe('test-RegExp', () => {
    it('should match', () => {
        expect(join('abab'.match(/ab*/))).to.equal('ab', "'abab'.match(/ab*/)");
        expect(join('abab'.match(/(ab)*/))).to.equal('abab ab', "'abab'.match(/ab*/)");
        let result;
        result = '2'.match(/^[0-9]/);
        expect(result[0]).to.equal('2', "/^[0-9]/");
        result = '2'.match(/^([0-9])/);
        expect(result[0]).to.equal('2', "/^([0-9])/");
        result = '23abc@digits34axy'.match(/^(?:[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy)/);
        expect(result[0]).to.equal('23abc@digits34axy', "/(?:[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy)/ 2");
        result = '23abc@digits34axy'.match(/(?:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy)/);
        expect(result[0]).to.equal('23abc@digits34axy', "/(?:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy)/ 1");

    });

    it('should replace', () => {
        expect(/(a)/g[Symbol.replace]('aa', (match, p1, offset) => p1+1)).to.equal('a1a1', /(a)/g);
    });
});
