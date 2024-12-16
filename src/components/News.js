import React, { Component } from 'react';
import NewsItems from './NewsItems';
import '../theme.css'
import Loading from './Loading';

export class News extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pokemons: [],
      currentPage: 1,
      totalPages: 0,
      loading: true,
      error: null,
      selectedType: 'All',
      types: [],
    };
  }

  async componentDidMount() {
    await this.fetchTypes(); // Fetch Pokémon types first
    this.fetchPokemons(1); // Fetch all Pokémon initially
  }

// Fetch all Pokémon types
fetchTypes = async () => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/type');
    const data = await response.json();
    const types = data.results.map((type) => type.name);

    this.setState({ types: types });
  } catch (error) {
    console.error('Error fetching Pokémon types:', error);
    this.setState({ error: 'Failed to fetch Pokémon types.' });
  }
};

// Fetch Pokémon data with filter and pagination logic
fetchPokemons = async (page) => {
  const limit = 10; // Number of Pokémon per page
  const offset = (page - 1) * limit;

  this.setState({ loading: true });

  try {
    let filteredPokemons = [];
    let totalFilteredPokemons = 0;

    if (this.state.selectedType === 'All') {
      // Fetch all Pokémon if no filter is applied
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
      const data = await response.json();
      totalFilteredPokemons = 1000; // Assume 1000 total Pokémon for "All"
      filteredPokemons = await Promise.all(
        data.results.map(async (pokemon) => {
          const pokemonDetails = await fetch(pokemon.url);
          const details = await pokemonDetails.json();
          return {
            name: pokemon.name,
            image: details.sprites.front_default,
            types: details.types.map((type) => type.type.name.toLowerCase()),
          };
        })
      );
    } else {
      // Fetch Pokémon of the selected type
      const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${this.state.selectedType.toLowerCase()}`);
      const typeData = await typeResponse.json();

      totalFilteredPokemons = typeData.pokemon.length; // Total Pokémon of the selected type
      const typeFiltered = typeData.pokemon.slice(offset, offset + limit); // Paginate filtered Pokémon
      filteredPokemons = await Promise.all(
        typeFiltered.map(async (pokemonEntry) => {
          const pokemonDetails = await fetch(pokemonEntry.pokemon.url);
          const details = await pokemonDetails.json();
          return {
            name: details.name,
            image: details.sprites.front_default,
            types: details.types.map((type) => type.type.name.toLowerCase()),
          };
        })
      );
    }

    this.setState({
      pokemons: filteredPokemons,
      totalPages: Math.ceil(totalFilteredPokemons / limit), // Dynamically adjust total pages
      currentPage: page,
      loading: false,
    });
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    this.setState({ error: 'Failed to fetch Pokémon.', loading: false });
  }
};

handleTypeChange = async (event) => {
  const selectedType = event.target.value;
  this.setState({ selectedType, currentPage: 1, pokemons: [] }, () => {
    this.fetchPokemons(1);
  });
};

  render() {
    const { pokemons, currentPage, totalPages, loading, error, selectedType, types } = this.state;

    if(loading) {
      return (
        <div className="text-center">
          <Loading />
        </div>
      );
    }

    if (error) {
      return <h1>Error: {error}</h1>;
    }

    return (
      <div className="container my-3">
        <h1 className="text-center">Pokémon Explorer</h1>

        {/* Dropdown to filter Pokémon by type */}
        <div className="mb-4">
          <select
            value={selectedType}
            onChange={this.handleTypeChange}
            className="form-select"
          >
            <option value="All">All</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Pokémon cards */}
        <div className="row">
          {pokemons.map((pokemon) => (
            <div key={pokemon.name} className="col-md-4">
              <NewsItems
                name={pokemon.name}
                imgUrl={pokemon.image}
                type={pokemon.types.join(', ')}
              />
            </div>
          ))}
        </div>

        {/* Pagination controls */}
        <div className="d-flex justify-content-between mt-4">
          <button
            className="btn btn-primary"
            disabled={currentPage === 1}
            onClick={() => this.fetchPokemons(currentPage - 1)}
          >
            Previous
          </button>
          <button
            className="btn btn-primary"
            disabled={currentPage === totalPages}
            onClick={() => this.fetchPokemons(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
}

export default News;
