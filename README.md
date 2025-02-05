# Garden Simulator

A 3D voxel-based garden simulator built with WebGL2. This project aims to create an interactive garden design and analysis tool with realistic mechanics and environmental testing systems.

## Current Status

The project is in early development, with basic engine features implemented:

- ✓ WebGL2 rendering engine with texture support
- ✓ Chunk-based world system (16x16x16 blocks)
- ✓ Basic player movement and collision
- ✓ Simple flat terrain generation
- ✓ Texture atlas and block registry
- ✓ Mouse look and WASD controls
- ✓ Limited world size (100x100x10 blocks)

## Planned Features

See [plan.md](plan.md) for the full development roadmap. Key upcoming features include:

- Soil testing and analysis system
- Plant growth simulation
- Environmental monitoring (light, temperature, moisture)
- Garden design tools
- Plant database with growth requirements
- Crafting and resource management

## Technical Details

The engine is built from scratch using:
- WebGL2 for rendering
- Pure JavaScript (no external game engines)
- Custom voxel engine implementation
- Client-side only (no server required)

See [design.md](design.md) for detailed technical specifications and architecture.

## Running the Project

1. Clone the repository
2. Copy required texture assets to `public/assets/textures/block/`
3. Open index.html in a web browser that supports WebGL2

## Controls

- WASD - Move
- Mouse - Look around
- Space - Jump
- Click canvas to lock mouse pointer

## Development Status

Currently in Phase 1 (Core Engine) of the development plan. Basic movement, rendering and world generation are working, but most garden simulation features are not yet implemented.

## License

[License details to be added] 
