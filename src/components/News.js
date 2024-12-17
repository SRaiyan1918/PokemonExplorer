import React, { Component } from 'react';
import NewsItems from './NewsItems';
import '../theme.css';
import Loading from './Loading';
import InfiniteScroll from 'react-infinite-scroll-component';

export class News extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pokemons: [],
      hasMore: true,
      currentPage: 1,
      selectedType: 'All',
      types: [],
      error: null,
      loading: true,
    };
  }

  async componentDidMount() {
    await this.fetchTypes();
    this.fetchPokemons(1);
  }

  // Fetch all Pokémon types
  fetchTypes = async () => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/type');
      const data = await response.json();
      const types = data.results.map((type) => type.name);
      this.setState({ types });
    } catch (error) {
      console.error('Error fetching Pokémon types:', error);
      this.setState({ error: 'Failed to fetch Pokémon types.' });
    }
  };

  // Fetch Pokémon data with infinite scrolling
  fetchPokemons = async (page) => {
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
      let newPokemons = [];
      if (this.state.selectedType === 'All') {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        newPokemons = await Promise.all(
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
        const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${this.state.selectedType.toLowerCase()}`);
        const typeData = await typeResponse.json();
        const filteredPokemons = typeData.pokemon.slice(offset, offset + limit);
        newPokemons = await Promise.all(
          filteredPokemons.map(async (pokemonEntry) => {
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

      this.setState((prevState) => ({
        pokemons: [...prevState.pokemons, ...newPokemons],
        currentPage: page,
        hasMore: newPokemons.length > 0,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
      this.setState({ error: 'Failed to fetch Pokémon.', loading: false });
    }
  };

  handleTypeChange = (event) => {
    const selectedType = event.target.value;
    this.setState({ selectedType, pokemons: [], currentPage: 1, hasMore: true }, () => {
      this.fetchPokemons(1);
    });
  };

  render() {
    const { pokemons, types, selectedType, error, hasMore } = this.state;

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

        {/* Pokémon Cards with Infinite Scroll */}
        <InfiniteScroll
          dataLength={pokemons.length}
          next={() => this.fetchPokemons(this.state.currentPage + 1)}
          hasMore={hasMore}
          loader={<Loading />}
        >
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
        </InfiniteScroll>
      </div>
    );
  }
}

export default News;
