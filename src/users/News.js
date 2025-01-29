import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, CardContent, Typography, Grid, CardMedia, Button } from '@mui/material';

const News = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNews = async () => {
        try {
            const response = await axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=e5761adf94fc461dbd70e2df32a126b3');
            setArticles(response.data.articles);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <Container>
            <Grid container spacing={2}>
                {articles.map((article) => (
                    <Grid item xs={12} sm={6} md={4} key={article.url}>
                        <Card>
                            {/* Add Image */}
                            {article.urlToImage && (
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={article.urlToImage}
                                    alt={article.title}
                                />
                            )}
                            <CardContent>
                                <Typography variant="h5" gutterBottom>{article.title}</Typography>
                                <Typography variant="body2" color="textSecondary">{article.description}</Typography>
                                <Typography variant="caption" display="block" gutterBottom>{article.source.name}</Typography>
                                {/* Add Link to Original Article */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ marginTop: '10px' }}
                                >
                                    Read More
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default News;
