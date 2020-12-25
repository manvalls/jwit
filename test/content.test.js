import { html, replace, append, prepend, insertAfter, insertBefore, one, apply } from '../src'
import expect from 'expect'

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('html', () => {
  it('should set the content of the element', async () => {
    await apply(
      one('body',
        html('<div>foo</div> <div>bar</div>'),
      ),
    )

    expect(document.body.innerHTML).toBe('<div>foo</div> <div>bar</div>')
  })

  it('should wait on external scripts', async () => {
    const promise = apply(
      one('body',
        html(`
          <span>foobar</span>
          <div>
            <span>before</span>
            <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha256-pasqAKBDmFT4eHoN2ndd6lN370kFiGUFyTiUHWhU7k8=" crossorigin="anonymous"></script>
            <span>after</span>
          </div>
        `.trim().replace(/\s{2}/g, '')),
      ),
    )

    await new Promise(res => setTimeout(res, 10))

    expect(document.body.innerHTML).toEqual(`
      <span>foobar</span>
      <div>
        <span>before</span>
        <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha256-pasqAKBDmFT4eHoN2ndd6lN370kFiGUFyTiUHWhU7k8=" crossorigin="anonymous"></script></div>
    `.trim().replace(/\s{2}/g, ''))

    await promise

    expect(document.body.innerHTML).toEqual(`
      <span>foobar</span>
      <div>
        <span>before</span>
        <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha256-pasqAKBDmFT4eHoN2ndd6lN370kFiGUFyTiUHWhU7k8=" crossorigin="anonymous"></script>
        <span>after</span>
      </div>
    `.trim().replace(/\s{2}/g, ''))
  })

  it('should wait on styleshets', async () => {
    const promise = apply(
      one('body',
        html('foo<link href="https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css" rel="stylesheet">bar'),
      ),
    )

    await new Promise(res => setTimeout(res, 10))
    expect(document.body.innerHTML).toEqual('foo<link href="https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css" rel="stylesheet">')
    await promise
    expect(document.body.innerHTML).toEqual('foo<link href="https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css" rel="stylesheet">bar')
  })
})

describe('replace', () => {
  it('should replace the element', async () => {
    await apply(
      one('body',
        html('<span>one</span><span id="test">two</span><span>three</span>'),
        one('#test',
          replace('<div>:D</div>'),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<span>one</span><div>:D</div><span>three</span>')
  })
})

describe('append', () => {
  it('should append to the element', async () => {
    await apply(
      one('body',
        html('<span>one</span>'),
        append('<span>two</span>'),
      ),
    )

    expect(document.body.innerHTML).toBe('<span>one</span><span>two</span>')
  })
})

describe('prepend', () => {
  it('should prepend to the element', async () => {
    await apply(
      one('body',
        html('<span>one</span>'),
        prepend('<span>two</span>'),
      ),
    )

    expect(document.body.innerHTML).toBe('<span>two</span><span>one</span>')
  })
})

describe('insertAfter', () => {
  it('should insert after the element', async () => {
    await apply(
      one('body',
        html('<span>one</span><span id="test">two</span><span>three</span>'),
        one('#test',
          insertAfter('<div>:D</div>'),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<span>one</span><span id="test">two</span><div>:D</div><span>three</span>')
  })
})

describe('insertBefore', () => {
  it('should insert before the element', async () => {
    await apply(
      one('body',
        html('<span>one</span><span id="test">two</span><span>three</span>'),
        one('#test',
          insertBefore('<div>:D</div>'),
        ),
      ),
    )

    expect(document.body.innerHTML).toBe('<span>one</span><div>:D</div><span id="test">two</span><span>three</span>')
  })
})
