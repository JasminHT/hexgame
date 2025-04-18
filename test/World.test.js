
import { expect, test } from 'vitest'
import  World  from '../src/World.js'

//Dependencies
import Hex from '../src/u/Hex.js'
import {Point, HexLayout, HexMap} from '../src/u/Hex.js'

//create a world
let earth_radius = 20;
let earth_location = new Point(0, 0);
var earth = new World( earth_radius, 'dust', earth_location );

test('Check that hexes are there', () => {
  expect(earth.containsHex(0,0)).toBe(true)
})

/*
test('description', () => {
  expect().toBe()
})
*/