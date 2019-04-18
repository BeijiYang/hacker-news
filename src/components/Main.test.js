import React from 'react'
import Main from './Main'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe('<App />', () => {
  it('renders a Header', () => {
    const wrapper = shallow(<Main />)
    const Header = wrapper.find('Header')
    expect(Header).toHaveLength(1)
  })

  it('renders a Content', () => {
    const wrapper = shallow(<Main />)
    const Content = wrapper.find('Content')
    expect(Content).toHaveLength(1)
  })
})