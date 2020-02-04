import { html, one, list, apply } from '../src'
import expect from 'expect'

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('list', () => {
  it('should apply all deltas', async () => {
    await apply(
      list(
        one('body',
          html('<div>foo</div><div>bar</div>'),
        ),
        one('div',
          html('42'),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<div>42</div><div>bar</div>')
  })
})
