import { html, one, setAttr, replaceAttr, rmAttr, setStyles, rmStyles, addClasses, rmClasses, apply } from '../src'
import expect from 'expect'

describe('setAttr', () => {
  it('should add an attribute to the element', async () => {
    await apply(
      one('body',
        html('<div foo="bar">one</div>'),
        one('div',
          setAttr({ bar: 'baz' }),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div foo="bar" bar="baz">one</div>')
  })
})

describe('replaceAttr', () => {
  it('should set the attributes of the element', async () => {
    await apply(
      one('body',
        html('<div foo="bar">one</div>'),
        one('div',
          replaceAttr({ bar: 'baz' }),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div bar="baz">one</div>')
  })
})

describe('rmAttr', () => {
  it('should remove the attributes from the element', async () => {
    await apply(
      one('body',
        html('<div foo="bar" bar="baz">one</div>'),
        one('div',
          rmAttr(['bar']),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div foo="bar">one</div>')
  })
})

describe('setStyles', () => {
  it('should add styles to the element', async () => {
    await apply(
      one('body',
        html('<div style="color: black;">one</div>'),
        one('div',
          setStyles({ border: '1px solid black' }),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div style="color: black; border: 1px solid black;">one</div>')
  })
})

describe('rmStyles', () => {
  it('should remove styles from the element', async () => {
    await apply(
      one('body',
        html('<div style="color: black; border: 1px solid black;">one</div>'),
        one('div',
          rmStyles(['color']),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div style="border: 1px solid black;">one</div>')
  })
})

describe('addClasses', () => {
  it('should add classes to the element', async () => {
    await apply(
      one('body',
        html('<div class="foo bar">one</div>'),
        one('div',
          addClasses('baz bar'),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div class="foo bar baz">one</div>')
  })
})

describe('rmClasses', () => {
  it('should remove classes from the element', async () => {
    await apply(
      one('body',
        html('<div class="foo bar">one</div>'),
        one('div',
          rmClasses('baz bar'),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div class="foo">one</div>')
  })
})
