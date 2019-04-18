import React from 'react'
import Content from './Content'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe('<Content />', () => {
  it('renders a Grid', () => {
    const wrapper = shallow(<Content />)
    const Grid = wrapper.find('Grid')
    expect(Grid).toHaveLength(1)
  })
})