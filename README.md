# Zypher Research System

## Overview

The Zypher Research System is an autonomous AI agent designed for advanced academic research and analysis. Built upon the **Zypher Framework**, this application leverages **Claude 4 Sonnet** for reasoning and **Firecrawl MCP** for external data retrieval. It provides a full-stack solution including a RESTful backend and a responsive web interface for analyzing research papers and conducting follow-up Q&A sessions.

## Key Features

* **Autonomous Data Retrieval**: Integrates with the Firecrawl Model Context Protocol (MCP) server to scrape and parse content from external URLs and research repositories.
* **Advanced Analytical Engine**: Utilizes Anthropic's Claude 4 Sonnet model to generate structured reports, specifically extracting core innovations, technical limitations, and future research directions.
* **Context-Aware Interactivity**: Features a persistent chat session allowing users to ask follow-up questions based on the specific context of the analyzed document.
* **Web-Based User Interface**: Delivers a professional-grade frontend built with Tailwind CSS for streamlined interaction and report visualization.

## System Requirements

Before deploying the application, ensure the following dependencies are installed:

* **Runtime**: Deno v2.0 or higher.
* **API Credentials**:
    * Anthropic API Key (Access to Claude models).
    * Firecrawl API Key (Web scraping capabilities).

## Installation and Setup

### 1. Clone the Repository

```bash
git clone [https://github.com/seancheung-strke/zypher-research-agent.git](https://github.com/seancheung-strke/zypher-research-agent.git)
cd zypher-research-agent

```
### 2. Install Dependencies
Initialize the project and cache required modules:

```bash

deno add jsr:@corespeed/zypher
deno add npm:rxjs-for-await
```

### 3. Environment Configuration
Create a .env file in the project root directory. This file must contain your API credentials and should not be committed to version control.

File: .env

```bash

ANTHROPIC_API_KEY=sk-ant-your_key_here
FIRECRAWL_API_KEY=fc-your_key_here
```

## Usage Guide
### Starting the Server
Execute the following command to start the backend server with necessary permissions:

```bash

deno run -A server.ts
```
The server will initialize and listen on port 8000 by default.

### Interface Navigation
Open a web browser and navigate to http://localhost:8000.

Input Target: Paste a URL to a research paper (e.g., Arxiv link) or enter a research topic.

Execute Analysis: Click the "Analyze" button. The system will asynchronously fetch the content and generate a Markdown report.

Interactive Q&A: Upon report generation, use the chat interface at the bottom to query specific details regarding the analyzed text.

## Project Structure
server.ts: The primary entry point. Manages the HTTP server, serves the frontend static assets, and orchestrates the Zypher Agent logic.

main.ts: Legacy command-line interface (CLI) implementation.

deno.json: Deno configuration and dependency management file.

.env: Environment variable configuration (Excluded from git).

## License
This project is built using the Zypher Framework.

