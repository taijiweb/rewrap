# rewrap

a regexp wrapper, less pain and more fun with regexp :)

## feature

* compose the regexp by string, regexp, rewrap object, using compositional method
* refer to the predefined regexp
* get match by named path

## document
`npm install rewrap`

```js

    const rewrap = require('rewrap');

    const {re, wrap} = rewrap; // wrap is the same as rewrap;

    re(/^/)  // /^/
    
      .ref('digits')  // /^[0-9]+/
      
      .and(/abc/)  /^[0-9]+abc/
      
      .or(/bc/, /cd/) // /^[0-9]+abc|bc|cd/
      
      // because the line below is leaded by re, 
      // so @digits will not refer to registry, 
      // and will generate regexp as is.
      .and(/@digits/) // /^[0-9]+abc|bc|cd@digits/
            
      .wrap // now switch to rewrap style
      
      // @digits will refer to registry, will be replaced by [0-9]+
      // necessary () is added automatically for or expression
      .and(/@digits/) // /(:^[0-9]+abc|bc|cd)@digits[0-9]+/
      
      // &a indicate that a will become (a) 
      // and will be saved as result.$$rewrapData.a while matching
      .and(/a&a/) // /^[0-9]+abc|bc|cd@digits[0-9]+(a)/
       
      .and(
      
         // generate (xy)
         // will be saved as result.$$rewrapData.xy while matching
         // same as wrap(/(xy)&xy/)
         wrap('x').and('y').save('xy')  // /(xy)/
        
      ) // /(:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy)/
```

### compositional method
  they have no side effects, i.e. they always generate a new Rewrap object.
  rewrap, regexp, or, and, paren, not, lookAhead, optional, any, some, repeat, times, timesMore, headTail, head, tail

### register, ref, @path%

register(registry)
register(path, value)

ref(path): same as /@path%/, % can be omit if the following char is not identifier chars [_A-Za-z0-9]

### save, &path%
someRewrap.save(path): same as /@someRewrap&path%/, % can be omit if the following char is not identifier chars [_A-Za-z0-9]
If necessary, () will be added to someRewrap.

### options method
  flags, registry

### switch source style
someRewrap.re: lead the regexp style chain  
someRewrap.wrap: lead the rewrap style chain
