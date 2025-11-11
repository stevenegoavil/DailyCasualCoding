# Community Garden
Sim Jim wants to be apart of the community garden in his local neiborhood, there is only 11 slot and 3 of them are already taken. He needs to fill out a form and then apply to be appart of this local garden.

# Construction of the contract

## Auth && Mapping
There will an owner which provides access to be let inside the gate to be able to get into the local garden
There is a fee of 10 dollars/month to use the garden, and you will get two keys to enter

There are 11 potenial slots to garden
3 are already taken by [slot 3: Sarah|A], [slot 8, Greg|A && Samuel], [slot 1, Baal|A && N/A]
The slot Sim Jim Wants is slot 11, N/A

## Functions
There should be a function that allows the auth of the contract to allow people access to their specific points (plots) on the contract
--TEST--
        anyone who is not auth should not be allowed to add/remove ownership of slots

There should be a function that allows a person who is the owner of the slot to be able to add their friend (1 person) to their slot
--TEST--
        anyone who isnt plot onswer should not be allowed to manipulate plot