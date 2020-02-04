import { html, one, all, root, apply, parent, firstChild, lastChild, prevSibling, nextSibling } from '../src'
import expect from 'expect'

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('one', () => {
  it('should affect only one element', async () => {
    await apply(
      one('body',
        html('<div>foo</div><div>bar</div>'),
        one('div',
          html('42'),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div>42</div><div>bar</div>')
  })
})

describe('all', () => {
  it('should affect all elements', async () => {
    await apply(
      one('body',
        html('<div>foo</div><div>bar</div>'),
        all('div',
          html('42'),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div>42</div><div>42</div>')
  })
})

describe('root', () => {
  it('should affect the root of the document', async () => {
    await apply(
      one('body',
        html('<div>foo</div><div>bar</div>'),
        one('div',
          root(
            one('body',
              html('foo'),
            ),
          ),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('foo')
  })
})

describe('parent', () => {
  it('should affect the parents of selected elements', async () => {
    await apply(
      one('body',
        html('<div><span>foo</span></div><div><span>bar</span></div>'),
        all('span',
          parent(
            html('42'),
          ),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div>42</div><div>42</div>')
  })
})

describe('firstChild', () => {
  it('should affect the first child of selected elements', async () => {
    await apply(
      one('body',
        html('<div><span>foo</span><span>foo</span></div><div><span>bar</span><span>bar</span></div>'),
        all('div',
          firstChild(
            html('42'),
          ),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div><span>42</span><span>foo</span></div><div><span>42</span><span>bar</span></div>')
  })

  describe('lastChild', () => {
    it('should affect the last child of selected elements', async () => {
      await apply(
        one('body',
          html('<div><span>foo</span><span>foo</span></div><div><span>bar</span><span>bar</span></div>'),
          all('div',
            lastChild(
              html('42'),
            ),
          ),
        ),
      )

      expect(document.body.innerHTML).toBe('<div><span>foo</span><span>42</span></div><div><span>bar</span><span>42</span></div>')
    })
  })
})

describe('prevSibling', () => {
  it('should affect the previous sibling', async () => {
    await apply(
      one('body',
        html('<div>foo</div><span>bar</span>'),
        one('span',
          prevSibling(
            html('42'),
          ),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div>42</div><span>bar</span>')
  })
})

describe('nextSibling', () => {
  it('should affect the next sibling', async () => {
    await apply(
      one('body',
        html('<div>foo</div><span>bar</span>'),
        one('div',
          nextSibling(
            html('42'),
          ),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div>foo</div><span>42</span>')
  })
})
