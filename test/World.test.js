
import { expect, test } from 'vitest'
import  World  from '../src/World.js'

//Dependencies
import Hex from '../src/u/Hex.js'
import {Point, HexLayout, HexMap} from '../src/u/Hex.js'

//create a world
let world_radius = 20;
let world_location = new Point(0, 0);
var world = new World( world_radius, 'dust', world_location );
let random_hex = world.getRandomHex();

test('World object created', () => {
  expect(world.radius).toBe(20)
})

test('Origin hex exists', () => {
  let hex = new Hex(0,0);
  expect(world.containsHex(hex)).toBe(true)
})

test('Correct number of hexes', () => {
  expect(world.tileCount()).toBe(955) //for a hexagon with 20 radius
})

test('Tiles are created', () => {
  expect(world.getTile(random_hex).hasOwnProperty('elevation')).toBe(true)
})

test('Units can be created', () => {
  world.createUnit(random_hex, 'city')
  expect(world.getUnit(random_hex).name).toBe("City")
})
/*
test('description', () => {
  expect().toBe()
})
*/